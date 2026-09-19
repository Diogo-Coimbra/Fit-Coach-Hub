import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  Alert,
  Keyboard,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import {
  useAudioRecorder,
  createAudioPlayer,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  RecordingPresets,
  AudioPlayer,
} from 'expo-audio';
import { useFocusEffect } from '@react-navigation/native';
import { BackButton, Card, Screen, showAlert } from '../components/ui';
import { useAuthStore } from '../store/useAuthStore';
import { useTheme } from '../store/useThemeStore';
import { useLanguage } from '../store/useLanguageStore';
import { api } from '../services/api';
import { radius, space } from '../theme';

interface ChatMessageItem {
  id: string;
  coachId: string;
  clientId: string;
  senderId: string;
  text?: string | null;
  mediaUrl?: string | null;
  mediaType?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE' | null;
  fileName?: string | null;
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    role: string;
    picture?: string | null;
  };
}

export default function ChatScreen({ route, navigation }: any) {
  const { user } = useAuthStore();
  const { colors } = useTheme();
  const { t } = useLanguage();

  // O targetUser pode vir dos route params (ex: PT clica num aluno, ou Aluno abre chat com PT)
  const targetUserId = route.params?.targetUserId;
  const targetUserName = route.params?.targetUserName || (user?.role === 'COACH' ? 'Aluno' : 'Treinador');
  const targetUserRole = route.params?.targetUserRole || (user?.role === 'COACH' ? 'Aluno' : 'Personal Trainer');

  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);

  // Modal para pré-visualização de imagem ampliada
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Estados para Gestão de Mensagens (Copiar, Editar, Apagar)
  const [selectedMsgForMenu, setSelectedMsgForMenu] = useState<ChatMessageItem | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessageItem | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const mediaRecorderRef = useRef<any>(null);
  const audioChunksRef = useRef<any[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const currentPlayerRef = useRef<AudioPlayer | null>(null);
  const webAudioRef = useRef<any>(null);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  // Auto-scroll ao abrir o teclado virtual
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );
    return () => {
      showSub.remove();
    };
  }, []);

  // Limpeza de áudio ao sair do ecrã
  useEffect(() => {
    return () => {
      if (currentPlayerRef.current) {
        try {
          currentPlayerRef.current.pause();
          currentPlayerRef.current.remove();
        } catch {}
        currentPlayerRef.current = null;
      }
      if (webAudioRef.current) {
        try {
          webAudioRef.current.pause();
        } catch {}
        webAudioRef.current = null;
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const handleCopyMessage = async (msg: ChatMessageItem) => {
    setSelectedMsgForMenu(null);
    if (!msg.text) return;
    await Clipboard.setStringAsync(msg.text);
    showAlert(t('common.success'), t('chat.messageCopied'));
  };

  const handleStartEdit = (msg: ChatMessageItem) => {
    setSelectedMsgForMenu(null);
    if (!msg.text) return;
    setEditingMessage(msg);
    setInputText(msg.text);
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setInputText('');
  };

  const handleSaveEdit = async () => {
    if (!editingMessage || !inputText.trim()) return;
    try {
      setIsSending(true);
      const updated = await api.patch(`/api/chat/messages/${editingMessage.id}`, {
        text: inputText.trim(),
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === editingMessage.id ? { ...m, text: updated.text } : m))
      );
      setEditingMessage(null);
      setInputText('');
    } catch (err: any) {
      console.error('Erro ao editar mensagem:', err);
      showAlert(t('common.error'), err.message || t('common.error'));
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMessage = (msg: ChatMessageItem) => {
    setSelectedMsgForMenu(null);
    const confirmDelete = async () => {
      try {
        await api.delete(`/api/chat/messages/${msg.id}`);
        setMessages((prev) => prev.filter((m) => m.id !== msg.id));
      } catch (err: any) {
        console.error('Erro ao apagar mensagem:', err);
        showAlert(t('common.error'), err.message || t('common.error'));
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(t('chat.deletePrompt'))) {
        confirmDelete();
      }
    } else {
      Alert.alert(t('chat.deleteMessage'), t('chat.deletePrompt'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('chat.deleteConfirm'), style: 'destructive', onPress: confirmDelete },
      ]);
    }
  };

  // Carregar mensagens
  const fetchMessages = async (silent = false) => {
    if (!targetUserId) return;
    try {
      if (!silent) setIsLoading(true);
      const data = await api.get(`/api/chat/${targetUserId}/messages`);
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (err: any) {
      if (!silent) {
        console.error('Erro ao carregar mensagens do chat:', err);
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMessages(false);
      // Polling periódico a cada 3.5 segundos para novas mensagens em tempo real
      const interval = setInterval(() => {
        fetchMessages(true);
      }, 3500);

      return () => clearInterval(interval);
    }, [targetUserId])
  );

  const handleSendMessage = async (
    textToSend?: string,
    mediaBase64?: string,
    mediaType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE' = 'TEXT',
    fileName?: string
  ) => {
    const trimmed = textToSend?.trim();
    if (!trimmed && !mediaBase64) return;

    setIsSending(true);
    try {
      const payload: any = {
        text: trimmed || null,
        mediaType,
        fileName: fileName || null,
      };
      if (mediaBase64) {
        payload.mediaBase64 = mediaBase64;
      }

      const newMsg = await api.post(`/api/chat/${targetUserId}/messages`, payload);
      setMessages((prev) => [...prev, newMsg]);
      setInputText('');
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (err: any) {
      console.error('Falha ao enviar mensagem:', err);
      showAlert(t('common.error'), err.message || 'Não foi possível enviar a mensagem.');
    } finally {
      setIsSending(false);
    }
  };

  // Enviar Imagem ou Vídeo da Galeria / Câmara
  const handlePickMedia = async (type: 'images' | 'videos') => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showAlert(t('common.attention'), 'Precisamos de permissão para aceder à galeria.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: type === 'videos' ? ImagePicker.MediaTypeOptions.Videos : ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        let base64Data = asset.base64;

        if (!base64Data && asset.uri) {
          try {
            base64Data = await FileSystem.readAsStringAsync(asset.uri, {
              encoding: FileSystem.EncodingType.Base64,
            });
          } catch (readErr) {
            console.warn('Erro ao ler base64 do ficheiro:', readErr);
          }
        }

        if (base64Data) {
          const isVideo = type === 'videos' || asset.type === 'video';
          const mimePrefix = isVideo ? 'data:video/mp4;base64,' : 'data:image/jpeg;base64,';
          await handleSendMessage(
            undefined,
            `${mimePrefix}${base64Data}`,
            isVideo ? 'VIDEO' : 'IMAGE',
            asset.fileName || (isVideo ? 'video_execucao.mp4' : 'foto.jpg')
          );
        }
      }
    } catch (err: any) {
      console.error('Erro ao anexar multimédia:', err);
      showAlert(t('common.error'), 'Não foi possível carregar o anexo.');
    }
  };

  // Gravação de Áudio / Nota de Voz (MediaRecorder na web, expo-audio no nativo)
  const startAudioRecording = async () => {
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mediaRecorder = new (window as any).MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];

          mediaRecorder.ondataavailable = (event: any) => {
            if (event.data.size > 0) {
              audioChunksRef.current.push(event.data);
            }
          };

          mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
              const base64Data = reader.result as string;
              await handleSendMessage(undefined, base64Data, 'AUDIO', `audio_${Date.now()}.webm`);
            };
            stream.getTracks().forEach((t) => t.stop());
          };

          mediaRecorder.start();
          setIsRecordingAudio(true);
          setRecordingSeconds(0);
          timerIntervalRef.current = setInterval(() => {
            setRecordingSeconds((prev) => prev + 1);
          }, 1000);
        } else {
          showAlert(t('common.attention'), 'Navegador sem suporte a gravação de áudio.');
        }
      } else {
        // Gravação nativa no telemóvel usando expo-audio (SDK moderno)
        const permission = await requestRecordingPermissionsAsync();
        if (!permission.granted) {
          showAlert(t('common.attention'), 'Precisamos de permissão para aceder ao microfone para gravar notas de voz.');
          return;
        }

        await setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
        });

        await audioRecorder.prepareToRecordAsync();
        audioRecorder.record();

        setIsRecordingAudio(true);
        setRecordingSeconds(0);
        timerIntervalRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
      }
    } catch (e: any) {
      console.error('Erro ao iniciar gravação de áudio:', e);
      showAlert(t('common.attention'), 'Não foi possível aceder ao microfone para gravar áudio.');
    }
  };

  const stopAudioRecording = async () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setIsRecordingAudio(false);

    try {
      if (Platform.OS === 'web') {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
        }
      } else {
        await audioRecorder.stop();
        await setAudioModeAsync({
          allowsRecording: false,
        });

        const uri = audioRecorder.uri || audioRecorder.getStatus()?.url;
        if (uri) {
          const base64Data = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          const formattedBase64 = `data:audio/m4a;base64,${base64Data}`;
          const fileName = `audio_${Date.now()}.m4a`;
          await handleSendMessage(undefined, formattedBase64, 'AUDIO', fileName);
        }
      }
    } catch (err) {
      console.error('Erro ao finalizar gravação de áudio:', err);
      showAlert(t('common.error'), 'Falha ao processar nota de voz gravada.');
    } finally {
      setRecordingSeconds(0);
    }
  };

  const cancelAudioRecording = async () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setIsRecordingAudio(false);
    setRecordingSeconds(0);

    try {
      if (Platform.OS === 'web') {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.onstop = null;
          mediaRecorderRef.current.stop();
        }
      } else {
        if (audioRecorder.isRecording) {
          await audioRecorder.stop().catch(() => {});
        }
        await setAudioModeAsync({
          allowsRecording: false,
        }).catch(() => {});
      }
    } catch (e) {
      console.warn('Erro ao cancelar gravação:', e);
    }
  };

  const handlePlayAudio = async (msgId: string, audioUrl?: string | null) => {
    if (!audioUrl) return;

    try {
      if (playingMsgId === msgId) {
        if (Platform.OS === 'web') {
          if (webAudioRef.current) {
            webAudioRef.current.pause();
            webAudioRef.current = null;
          }
        } else {
          if (currentPlayerRef.current) {
            try {
              currentPlayerRef.current.pause();
              currentPlayerRef.current.remove();
            } catch {}
            currentPlayerRef.current = null;
          }
        }
        setPlayingMsgId(null);
        return;
      }

      // Parar qualquer áudio anterior
      if (Platform.OS === 'web') {
        if (webAudioRef.current) {
          webAudioRef.current.pause();
          webAudioRef.current = null;
        }
      } else {
        if (currentPlayerRef.current) {
          try {
            currentPlayerRef.current.pause();
            currentPlayerRef.current.remove();
          } catch {}
          currentPlayerRef.current = null;
        }
      }

      if (Platform.OS === 'web') {
        const audio = new (window as any).Audio(audioUrl);
        webAudioRef.current = audio;
        setPlayingMsgId(msgId);
        audio.onended = () => {
          setPlayingMsgId(null);
          webAudioRef.current = null;
        };
        audio.onerror = () => {
          setPlayingMsgId(null);
          webAudioRef.current = null;
        };
        audio.play();
      } else {
        await setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: true,
        });
        const player = createAudioPlayer(audioUrl);
        currentPlayerRef.current = player;
        const subscription = (player as any).addListener('playbackStatusUpdate', (status: any) => {
          if (status.didJustFinish) {
            setPlayingMsgId(null);
            subscription?.remove();
            try {
              player.remove();
            } catch {}
            if (currentPlayerRef.current === player) {
              currentPlayerRef.current = null;
            }
          }
        });
        setPlayingMsgId(msgId);
        player.play();
      }
    } catch (e: any) {
      console.error('Erro ao reproduzir áudio:', e);
      showAlert(t('common.error'), 'Não foi possível reproduzir a mensagem de voz.');
      setPlayingMsgId(null);
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const renderMessage = ({ item }: { item: ChatMessageItem }) => {
    const isMe = item.senderId === user?.id;

    return (
      <View
        style={[
          styles.messageRow,
          isMe ? styles.messageRowMe : styles.messageRowOther,
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.88}
          onLongPress={() => setSelectedMsgForMenu(item)}
          delayLongPress={300}
          style={[
            styles.messageBubble,
            isMe
              ? [styles.bubbleMe, { backgroundColor: colors.accent }]
              : [styles.bubbleOther, { backgroundColor: colors.surface, borderColor: colors.border }],
          ]}
        >
          {/* Cabeçalho do remetente se não for eu */}
          {!isMe && (
            <Text style={[styles.senderName, { color: colors.accent }]}>
              {item.sender?.name || targetUserName}
            </Text>
          )}

          {/* Anexo de Imagem */}
          {item.mediaType === 'IMAGE' && item.mediaUrl ? (
            <TouchableOpacity onPress={() => setPreviewImage(item.mediaUrl!)}>
              <Image
                source={{ uri: item.mediaUrl }}
                style={styles.attachedImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ) : null}

          {/* Anexo de Vídeo */}
          {item.mediaType === 'VIDEO' && item.mediaUrl ? (
            <TouchableOpacity
              style={styles.videoAttachmentBox}
              onPress={() => {
                if (Platform.OS === 'web') {
                  window.open(item.mediaUrl!, '_blank');
                } else {
                  showAlert(t('chat.videoTitle'), `${item.mediaUrl}`);
                }
              }}
            >
              <View style={styles.videoPlayCircle}>
                <Ionicons name="play" size={24} color="#FFF" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.videoTitle, { color: isMe ? '#FFF' : colors.text }]}>
                  🎥 {t('chat.videoTitle')}
                </Text>
                <Text style={[styles.videoSub, { color: isMe ? 'rgba(255,255,255,0.7)' : colors.muted }]}>
                  {t('chat.tapToPlay')}
                </Text>
              </View>
            </TouchableOpacity>
          ) : null}

          {/* Anexo de Áudio / Nota de Voz */}
          {item.mediaType === 'AUDIO' ? (
            <View style={styles.audioAttachmentBox}>
              <TouchableOpacity
                style={[styles.audioPlayBtn, { backgroundColor: isMe ? 'rgba(255,255,255,0.25)' : colors.accent }]}
                onPress={() => handlePlayAudio(item.id, item.mediaUrl)}
              >
                <Ionicons
                  name={playingMsgId === item.id ? 'pause' : 'play'}
                  size={18}
                  color="#FFF"
                />
              </TouchableOpacity>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[styles.audioTitle, { color: isMe ? '#FFF' : colors.text }]}>
                  {playingMsgId === item.id ? `▶️ ${t('chat.playingAudio')}` : `🎙️ ${t('chat.voiceNote')}`}
                </Text>
                <Text style={[styles.audioWave, { color: isMe ? 'rgba(255,255,255,0.7)' : colors.muted }]}>
                  {playingMsgId === item.id ? 'ılılılılılıl' : '••• ılıılılı'}
                </Text>
              </View>
            </View>
          ) : null}

          {/* Texto da Mensagem */}
          {item.text ? (
            <Text
              style={[
                styles.messageText,
                { color: isMe ? '#FFFFFF' : colors.text },
              ]}
            >
              {item.text}
            </Text>
          ) : null}

          {/* Rodapé da Bolha com Hora e Recibo de Leitura */}
          <View style={styles.bubbleFooter}>
            <Text
              style={[
                styles.messageTime,
                { color: isMe ? 'rgba(255,255,255,0.65)' : colors.muted },
              ]}
            >
              {formatTime(item.createdAt)}
            </Text>
            {isMe && (
              <Ionicons
                name="checkmark-done"
                size={14}
                color={item.isRead ? '#93C5FD' : 'rgba(255,255,255,0.5)'}
                style={{ marginLeft: 4 }}
              />
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Barra de Topo do Chat */}
        <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <BackButton onPress={() => navigation.goBack()} />

          <View style={styles.headerInfo}>
            <View style={[styles.avatarCircle, { backgroundColor: colors.accent + '25', borderColor: colors.accent }]}>
              <Ionicons
                name={targetUserRole === 'Personal Trainer' ? 'fitness' : 'person'}
                size={18}
                color={colors.accent}
              />
            </View>
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={[styles.contactName, { color: colors.text }]} numberOfLines={1}>
                {targetUserName}
              </Text>
              <View style={styles.statusRow}>
                <View style={styles.onlineDot} />
                <Text style={[styles.statusText, { color: colors.muted }]}>
                  {targetUserRole} • Online
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Lista de Mensagens */}
        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Ionicons name="chatbubbles-outline" size={48} color={colors.muted} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  {t('chat.privateChannel')}
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
                  {t('chat.channelDescription', { name: targetUserName })}
                </Text>
              </View>
            }
          />
        )}

        {/* Barra de Edição Ativa */}
        {editingMessage && (
          <View style={[styles.editingBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.editingLabel, { color: colors.accent }]}>
                {t('chat.editing')}
              </Text>
              <Text style={[styles.editingPreview, { color: colors.muted }]} numberOfLines={1}>
                {editingMessage.text}
              </Text>
            </View>
            <TouchableOpacity onPress={handleCancelEdit} style={{ padding: 6 }}>
              <Ionicons name="close" size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>
        )}

        {/* Painel de Gravação de Áudio Ativa */}
        {isRecordingAudio ? (
          <View style={[styles.recordingBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.recordingPulse}>
              <View style={styles.redDot} />
              <Text style={[styles.recordingText, { color: colors.text }]}>
                {t('chat.recordingAudio')} {recordingSeconds}s
              </Text>
            </View>
            <View style={styles.recordingActions}>
              <TouchableOpacity style={styles.cancelRecBtn} onPress={cancelAudioRecording}>
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.sendRecBtn, { backgroundColor: colors.accent }]} onPress={stopAudioRecording}>
                <Ionicons name="send" size={18} color={colors.bg} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Barra de Entrada de Mensagem */
          <View style={[styles.inputBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            {/* Anexar Foto */}
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => handlePickMedia('images')}
              disabled={isSending || !!editingMessage}
            >
              <Ionicons name="image-outline" size={22} color={colors.muted} />
            </TouchableOpacity>

            {/* Anexar Vídeo de Execução */}
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => handlePickMedia('videos')}
              disabled={isSending || !!editingMessage}
            >
              <Ionicons name="videocam-outline" size={22} color={colors.muted} />
            </TouchableOpacity>

            {/* Campo de Texto */}
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.bg,
                  borderColor: editingMessage ? colors.accent : colors.border,
                  color: colors.text,
                },
              ]}
              placeholder={t('chat.typeMessage')}
              placeholderTextColor={colors.muted}
              multiline
              value={inputText}
              onChangeText={setInputText}
              maxLength={1500}
            />

            {/* Botão de Enviar ou Botão de Gravar Áudio */}
            {editingMessage ? (
              <TouchableOpacity
                style={[styles.sendBtn, { backgroundColor: colors.accent }]}
                onPress={handleSaveEdit}
                disabled={isSending || !inputText.trim()}
              >
                {isSending ? (
                  <ActivityIndicator size="small" color={colors.bg} />
                ) : (
                  <Ionicons name="checkmark" size={20} color={colors.bg} />
                )}
              </TouchableOpacity>
            ) : inputText.trim().length > 0 ? (
              <TouchableOpacity
                style={[styles.sendBtn, { backgroundColor: colors.accent }]}
                onPress={() => handleSendMessage(inputText)}
                disabled={isSending}
              >
                {isSending ? (
                  <ActivityIndicator size="small" color={colors.bg} />
                ) : (
                  <Ionicons name="send" size={18} color={colors.bg} />
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.micBtn, { backgroundColor: colors.accent + '20' }]}
                onPress={startAudioRecording}
                disabled={isSending}
              >
                <Ionicons name="mic" size={20} color={colors.accent} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Modal de Menu de Contexto da Mensagem (Long Press) */}
      <Modal
        visible={!!selectedMsgForMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedMsgForMenu(null)}
      >
        <TouchableOpacity
          style={styles.actionSheetBackdrop}
          activeOpacity={1}
          onPress={() => setSelectedMsgForMenu(null)}
        >
          <View style={[styles.actionSheetCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.actionSheetHeader}>
              <Text style={[styles.actionSheetPreview, { color: colors.muted }]} numberOfLines={2}>
                {selectedMsgForMenu?.text || (selectedMsgForMenu?.mediaType ? `[${selectedMsgForMenu.mediaType}]` : '')}
              </Text>
            </View>

            {/* Copiar Texto */}
            {!!selectedMsgForMenu?.text && (
              <TouchableOpacity
                style={[styles.actionSheetBtn, { borderBottomColor: colors.border }]}
                onPress={() => selectedMsgForMenu && handleCopyMessage(selectedMsgForMenu)}
              >
                <Ionicons name="copy-outline" size={20} color={colors.text} />
                <Text style={[styles.actionSheetBtnText, { color: colors.text }]}>
                  {t('chat.copy')}
                </Text>
              </TouchableOpacity>
            )}

            {/* Editar Mensagem (se for o autor e texto) */}
            {selectedMsgForMenu?.senderId === user?.id && !!selectedMsgForMenu?.text && (
              <TouchableOpacity
                style={[styles.actionSheetBtn, { borderBottomColor: colors.border }]}
                onPress={() => selectedMsgForMenu && handleStartEdit(selectedMsgForMenu)}
              >
                <Ionicons name="pencil-outline" size={20} color={colors.accent} />
                <Text style={[styles.actionSheetBtnText, { color: colors.accent }]}>
                  {t('chat.edit')}
                </Text>
              </TouchableOpacity>
            )}

            {/* Apagar Mensagem (se for o autor ou PT) */}
            {(selectedMsgForMenu?.senderId === user?.id || user?.role === 'COACH') && (
              <TouchableOpacity
                style={[styles.actionSheetBtn, { borderBottomColor: colors.border }]}
                onPress={() => selectedMsgForMenu && handleDeleteMessage(selectedMsgForMenu)}
              >
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
                <Text style={[styles.actionSheetBtnText, { color: colors.danger }]}>
                  {t('chat.delete')}
                </Text>
              </TouchableOpacity>
            )}

            {/* Cancelar */}
            <TouchableOpacity
              style={styles.actionSheetCancelBtn}
              onPress={() => setSelectedMsgForMenu(null)}
            >
              <Text style={[styles.actionSheetCancelText, { color: colors.muted }]}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal de Zoom de Imagem */}
      <Modal visible={!!previewImage} transparent animationType="fade" onRequestClose={() => setPreviewImage(null)}>
        <View style={styles.imageModalBackdrop}>
          <TouchableOpacity style={styles.closeImageBtn} onPress={() => setPreviewImage(null)}>
            <Ionicons name="close-circle" size={32} color="#FFF" />
          </TouchableOpacity>
          {previewImage ? (
            <Image source={{ uri: previewImage }} style={styles.fullImage} resizeMode="contain" />
          ) : null}
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderBottomWidth: 1,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactName: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: radius.full,
    backgroundColor: '#10B981',
    marginRight: 5,
  },
  statusText: {
    fontSize: 12,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    paddingHorizontal: space.md,
    paddingVertical: space.md,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xl,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '82%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.lg,
  },
  bubbleMe: {
    borderBottomRightRadius: 2,
  },
  bubbleOther: {
    borderBottomLeftRadius: 2,
    borderWidth: 1,
  },
  senderName: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  attachedImage: {
    width: 220,
    height: 160,
    borderRadius: radius.md,
    marginBottom: 6,
  },
  videoAttachmentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 10,
    borderRadius: radius.md,
    marginBottom: 6,
  },
  videoPlayCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  videoSub: {
    fontSize: 11,
    marginTop: 2,
  },
  audioAttachmentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    minWidth: 160,
  },
  audioPlayBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  audioWave: {
    fontSize: 12,
    marginTop: 2,
  },
  bubbleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 11,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.sm,
    paddingVertical: space.sm,
    borderTopWidth: 1,
  },
  iconBtn: {
    padding: 8,
  },
  textInput: {
    flex: 1,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 15,
    maxHeight: 100,
    marginHorizontal: 4,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  micBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  recordingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.md,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  recordingPulse: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: '#EF4444',
    marginRight: 8,
  },
  recordingText: {
    fontSize: 14,
    fontWeight: '700',
  },
  recordingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cancelRecBtn: {
    padding: 8,
  },
  sendRecBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeImageBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  fullImage: {
    width: '95%',
    height: '80%',
  },
  editingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.md,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  editingLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  editingPreview: {
    fontSize: 12,
    marginTop: 2,
  },
  actionSheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    padding: space.md,
  },
  actionSheetCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: space.sm,
    overflow: 'hidden',
  },
  actionSheetHeader: {
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  actionSheetPreview: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  actionSheetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: space.md,
    borderBottomWidth: 1,
  },
  actionSheetBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  actionSheetCancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 4,
  },
  actionSheetCancelText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
