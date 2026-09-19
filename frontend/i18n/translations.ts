export type Language = 'pt' | 'en' | 'es' | 'fr';

export interface Translations {
  common: {
    save: string;
    saving: string;
    cancel: string;
    delete: string;
    back: string;
    loading: string;
    error: string;
    success: string;
    confirm: string;
    edit: string;
    close: string;
    remove: string;
    yes: string;
    no: string;
    discard: string;
    attention: string;
    status: string;
  };
  auth: {
    appTitle: string;
    appSubtitle: string;
    loginAs: string;
    coach: string;
    client: string;
    continueGoogle: string;
    devSectionTitle: string;
    devCoachBtn: string;
    devClientBtn: string;
  };
  dashboard: {
    hello: string;
    roleCoach: string;
    roleClient: string;
    weeklyGoal: string;
    currentStreak: string;
    sessions: string;
    myStudents: string;
    inviteStudent: string;
    templates: string;
    createWorkout: string;
    aiGenerator: string;
    alertsTitle: string;
    alertsSubtitle: string;
    inactiveFor: string;
    noStudents: string;
    emptyInviteBtn: string;
    todayWorkout: string;
    startWorkout: string;
    workoutsCompleted: string;
    activeClients: string;
    clientWorkoutsWeek: string;
    workoutsCompletedClient: string;
    trainingTime: string;
    thisWeek: string;
    weeksInARow: string;
    noWorkoutsAssigned: string;
    assignedWorkouts: string;
    nutritionAndPhotos: string;
    history: string;
    metricsWeight: string;
    myDashboard: string;
    yourCoach: string;
    startWeekCopy: string;
    remainingWorkouts: string;
    goalMetCopy: string;
    goalMet: string;
    noWorkoutsYet: string;
    workoutsThisWeek: string;
    lastWorkoutDays: string;
    notStartedYet: string;
    proSubscriptionActive: string;
    proSubscriptionTitle: string;
    proAccessDesc: string;
    trialDaysLeftDesc: string;
    trialActiveDesc: string;
    assignedByCoach: string;
    individualPlan: string;
  };
  workouts: {
    title: string;
    prescribedWorkouts: string;
    assignWorkout: string;
    assignFromTemplate: string;
    createManually: string;
    generateWithAI: string;
    exercisesCount: string;
    sets: string;
    reps: string;
    weight: string;
    rest: string;
    notes: string;
    startWorkout: string;
    finishWorkout: string;
    finishSession: string;
    cloneWorkout: string;
    deleteWorkout: string;
    restTimer: string;
    studentFeedback: string;
    createWorkoutTitle: string;
    createTemplateTitle: string;
    workoutNameLabel: string;
    workoutNamePlaceholder: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    categoryLabel: string;
    saveAndAddExercises: string;
    createTemplateAndAddExercises: string;
    addExerciseTitle: string;
    editExerciseTitle: string;
    exerciseName: string;
    exerciseNamePlaceholder: string;
    setsLabel: string;
    repsLabel: string;
    weightLabel: string;
    restSecondsLabel: string;
    notesLabel: string;
    notesPlaceholder: string;
    saveExercise: string;
    aiWorkoutTitle: string;
    aiCoachSubtitle: string;
    aiClientSubtitle: string;
    aiPromptLabel: string;
    aiPromptPlaceholder: string;
    generateWorkoutBtn: string;
    generatingWorkout: string;
    record: string;
    set: string;
    restBetweenSets: string;
    restCompleted: string;
    prescribedExercises: string;
    addExercise: string;
    noExercises: string;
    sessionNotes: string;
    sessionNotesPlaceholder: string;
    deleteWorkoutConfirm: string;
    deleteExerciseConfirm: string;
    removeExerciseTitle: string;
    workoutFinishedTitle: string;
    workoutFinishedMsg: string;
    nameRequiredAlert: string;
    assignWorkoutSubtitle: string;
    createWorkoutSubtitle: string;
    createTemplateSubtitle: string;
    catHypertrophy: string;
    catStrength: string;
    catFatLoss: string;
    catFullBody: string;
    catConditioning: string;
    aiDescribeWorkoutTitle: string;
    aiDescribeWorkoutMsg: string;
    aiGeneratedDefault: string;
    aiWorkoutCreatedTitle: string;
    aiWorkoutAssignedSuccess: string;
    aiWorkoutReadySuccess: string;
    aiFailedTitle: string;
    aiFailedMsg: string;
    requiredFieldsTitle: string;
    requiredFieldsAlert: string;
    suggestedWeight: string;
    targetSets: string;
    executionNotes: string;
    executionNotesPlaceholder: string;
    addToPlan: string;
    previous: string;
    noPrevious: string;
    setTypeNormal: string;
    setTypeWarmup: string;
    setTypeDropset: string;
    setTypeFailure: string;
    timerVibrated: string;
    selectFromLibrary: string;
    searchExercise: string;
    catAll: string;
    catChest: string;
    catBack: string;
    catLegs: string;
    catShoulders: string;
    catArms: string;
    catCore: string;
    equipment: string;
    instructions: string;
    fillFromExercise: string;
    lastSession: string;
    repShort: string;
  };
  nutrition: {
    title: string;
    subtitle: string;
    dailyGoals: string;
    dailyGoal: string;
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
    adjustGoals: string;
    registeredMeals: string;
    todayMeals: string;
    logMeal: string;
    mealName: string;
    noMeals: string;
    noMealsToday: string;
    scanMeal: string;
    galleryMeal: string;
    analyzingFood: string;
    nutritionEstimate: string;
    discard: string;
    saveMeal: string;
    todayTotal: string;
    cannotAnalyze: string;
    cannotAnalyzeTips: string;
  };
  assessment: {
    title: string;
    newAssessment: string;
    weight: string;
    bodyFat: string;
    chest: string;
    waist: string;
    arms: string;
    thighs: string;
    evolutionPhoto: string;
    takeOrUploadPhoto: string;
    removePhoto: string;
    technicalNotes: string;
    noAssessments: string;
    saveAssessment: string;
  };
  subscription: {
    proBadge: string;
    proTitle: string;
    trialExpiredTitle: string;
    trialExpiredDesc: string;
    activeDesc: string;
    trialingDesc: string;
    pricePerMonth: string;
    cancelAnytime: string;
    activateStripe: string;
    activateDemo: string;
    manageBilling: string;
    logout: string;
    daysLeftTrial: string;
    statusActive: string;
    statusExpired: string;
    statusTrial: string;
    featureUnlimitedStudents: string;
    featureTemplates: string;
    featureNutrition: string;
    featureAssessments: string;
    featureAI: string;
    featureRetention: string;
    noStripeKeyPrompt: string;
  };
  profile: {
    title: string;
    name: string;
    placeholderName: string;
    settingsAndAppearance: string;
    themeSub: string;
    themeTitle: string;
    themeDark: string;
    themeLight: string;
    languageTitle: string;
    yourCoach: string;
    coachCodeDesc: string;
    linkBtn: string;
    weeklyGoalTitle: string;
    weeklyGoalSub: string;
    weeklySessions: string;
    saveGoalBtn: string;
    weightLogTitle: string;
    weightLogSub: string;
    logWeightBtn: string;
    subCoachTitle: string;
    subCoachSub: string;
    subActiveDesc: string;
    subExpiredDesc: string;
    subTrialDesc: string;
    manageBillingStripe: string;
    subscribePlanPrice: string;
    devToolsTitle: string;
    simulateActivation: string;
    simulateExpiry: string;
    switchRoleBtn: string;
    switchToClient: string;
    switchToCoach: string;
    logoutBtn: string;
    errorLoadingImage: string;
    nameRequired: string;
    nameRequiredMsg: string;
    goalSavedSuccess: string;
    invalidWeightMsg: string;
    enterInviteCodePrompt: string;
    linkedCoachSuccess: string;
    switchRoleTitle: string;
    switchRoleConfirm: string;
    switchRoleSuccess: string;
    devSubscriptionActivated: string;
    devModeTitle: string;
    devTrialExpired: string;
    stripePortal: string;
    saveChanges: string;
  };
  clientDetails: {
    studentFile: string;
    currentWeight: string;
    currentStreak: string;
    weeklyGoal: string;
    tabWorkouts: string;
    tabHistory: string;
    tabNutrition: string;
    tabAssessment: string;
    prescribedPlans: string;
    assignWorkout: string;
    exercisesCount: string;
    noWorkoutsAssigned: string;
    prescribeFirst: string;
    selectAssignMethod: string;
    fromTemplate: string;
    withAI: string;
    createManually: string;
    adjustGoals: string;
    dailyCalories: string;
    dailyProtein: string;
    dailyCarbs: string;
    dailyFat: string;
    weeklySessions: string;
    saveGoals: string;
    newAssessment: string;
    evolutionPhoto: string;
    takeOrPickPhoto: string;
    removePhoto: string;
    technicalNotes: string;
    recordAssessment: string;
    removeStudent: string;
    confirmRemoveStudent: string;
    latestWeight: string;
    nutritionAndGoalsTitle: string;
    nutritionAndGoalsSub: string;
    adjust: string;
    selectTemplateSub: string;
    assignTemplateTitle: string;
    assignTemplateConfirm: string;
    assignTemplateSuccess: string;
    studentRemovedSuccess: string;
    modalGoalsTitle: string;
    modalGoalsSub: string;
    modalAssessmentSub: string;
    bodyPerimeters: string;
    weightRequiredAlert: string;
    assessmentSavedSuccess: string;
    goalsSavedSuccess: string;
    noFinishedWorkouts: string;
    noMealsRecorded: string;
    weeksCount: string;
    perWeek: string;
  };
  templates: {
    title: string;
    subtitle: string;
    createTemplate: string;
    emptyTitle: string;
    emptyDesc: string;
    deleteTemplateConfirm: string;
  };
  history: {
    title: string;
    subtitle: string;
    noLogs: string;
    exportCSV: string;
    shareWorkout: string;
    noDataToExport: string;
    workoutCompletedShare: string;
    workoutCompletedDefault: string;
    noData: string;
    csvExportError: string;
    shareNotAvailable: string;
  };
  invite: {
    title: string;
    desc: string;
    codeLabel: string;
    validFor: string;
    shareBtn: string;
    generateBtn: string;
    shareMessage: string;
  };
  analytics: {
    chartsTitle: string;
    chartsSubtitle: string;
    coachChartsSubtitle: string;
    weightEvolution: string;
    weightEmptyPrompt: string;
    strengthEvolution: string;
    strengthEmptyPrompt: string;
    estimated1RM: string;
    noSessionsCompleted: string;
    noChartData: string;
  };
  checkin: {
    title: string;
    bannerSubtitle: string;
    tabTitle: string;
    emptyTitle: string;
    emptyText: string;
    sendPushBtn: string;
    prescribedByCoach: string;
    painAlert: string;
    feedbackTitle: string;
    feedbackPlaceholder: string;
    sendFeedbackBtn: string;
    feedbackSentSuccess: string;
  };
  exerciseGuide: {
    title: string;
    targetMuscles: string;
    setupTitle: string;
    executionTitle: string;
    mistakesTitle: string;
    videoDemoTitle: string;
    watchOnYoutube: string;
    editVideoUrl: string;
    saveVideoUrl: string;
    videoUrlPlaceholder: string;
    videoUrlSaved: string;
  };
  substituteExercise: {
    modalTitle: string;
    modalSubtitle: string;
    searchPlaceholder: string;
    recommendedEquivalents: string;
    allEquivalents: string;
    confirmSwapTitle: string;
    confirmSwapMessage: string;
    swapSuccess: string;
    sameGroupTag: string;
    dumbbellAltTag: string;
    cableAltTag: string;
    machineAltTag: string;
  };
}

export const translations: Record<Language, Translations> = {
  pt: {
    common: {
      save: 'Guardar',
      saving: 'A guardar...',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      back: 'Voltar',
      loading: 'A carregar...',
      error: 'Erro',
      success: 'Sucesso',
      confirm: 'Confirmar',
      edit: 'Editar',
      close: 'Fechar',
      remove: 'Remover',
      yes: 'Sim',
      no: 'Não',
      discard: 'Descartar',
      attention: 'Atenção',
      status: 'Estado',
    },
    auth: {
      appTitle: 'Fit Coach Hub',
      appSubtitle: 'Plataforma para Personal Trainers gerirem clientes, treinos e evolução.',
      loginAs: 'Pretendes entrar como:',
      coach: 'Personal Trainer',
      client: 'Aluno / Cliente',
      continueGoogle: 'Continuar com Google',
      devSectionTitle: 'Modo de Teste Rápido (Sem Google)',
      devCoachBtn: 'Entrar como Treinador (PT)',
      devClientBtn: 'Entrar como Aluno (Cliente)',
    },
    dashboard: {
      hello: 'Olá',
      roleCoach: 'Personal Trainer',
      roleClient: 'Aluno',
      weeklyGoal: 'Meta Semanal',
      currentStreak: 'Streak Atual',
      sessions: 'sessões',
      myStudents: 'Os Meus Alunos',
      inviteStudent: '+ Convidar Aluno',
      templates: 'Modelos',
      createWorkout: 'Criar Treino',
      aiGenerator: 'Gerador IA',
      alertsTitle: 'Alertas de Acompanhamento',
      alertsSubtitle: 'Alunos que necessitam de contacto para prevenir abandono:',
      inactiveFor: 'Inativo há',
      noStudents: 'Ainda não tens alunos associados',
      emptyInviteBtn: '+ Gerar Código de Convite',
      todayWorkout: 'O Teu Treino',
      startWorkout: 'Iniciar Treino',
      workoutsCompleted: 'treinos concluídos',
      activeClients: 'Alunos Ativos',
      clientWorkoutsWeek: 'Treinos dos Alunos (Semana)',
      workoutsCompletedClient: 'Treinos Realizados',
      trainingTime: 'Tempo de Treino',
      thisWeek: 'Esta semana',
      weeksInARow: 'semanas seguidas',
      noWorkoutsAssigned: 'Ainda não tens treinos atribuídos. O teu Personal Trainer irá associar planos à tua conta em breve.',
      assignedWorkouts: 'Os Teus Treinos Atribuídos',
      nutritionAndPhotos: 'Nutrição & Fotos',
      history: 'Histórico',
      metricsWeight: 'Peso / Métricas',
      myDashboard: 'O Teu Painel',
      yourCoach: 'O Teu Personal Trainer',
      startWeekCopy: 'Inicia a semana com uma sessão de treino.',
      remainingWorkouts: 'Faltam {count} treino(s) esta semana.',
      goalMetCopy: 'Meta semanal concluída! Excelente trabalho.',
      goalMet: 'Meta cumprida',
      noWorkoutsYet: 'Sem treinos',
      workoutsThisWeek: 'treinos esta semana',
      lastWorkoutDays: 'Último treino há {days} dias',
      notStartedYet: 'Ainda não iniciou o plano prescrito',
      proSubscriptionActive: 'Subscrição Fit Coach Pro Ativa',
      proSubscriptionTitle: 'Plano Personal Trainer',
      proAccessDesc: 'Acesso profissional ilimitado. Toque para gerir faturação.',
      trialDaysLeftDesc: 'Período de avaliação: {days} dias restantes. Toque para subscrever.',
      trialActiveDesc: 'Avaliação gratuita ativa. Toque para subscrever.',
      assignedByCoach: 'Atribuído pelo PT {name}',
      individualPlan: 'Plano de treino individual',
    },
    workouts: {
      title: 'Treinos',
      prescribedWorkouts: 'Planos Prescritos',
      assignWorkout: 'Atribuir Treino',
      assignFromTemplate: 'A partir de Modelo',
      createManually: 'Criar Manualmente',
      generateWithAI: 'Gerador com Inteligência Artificial',
      exercisesCount: 'exercícios',
      sets: 'séries',
      reps: 'reps',
      weight: 'peso',
      rest: 'descanso',
      notes: 'observações',
      startWorkout: 'Começar Treino',
      finishWorkout: 'Concluir Sessão',
      finishSession: 'Concluir Sessão',
      cloneWorkout: 'Duplicar Treino',
      deleteWorkout: 'Eliminar Treino',
      restTimer: 'Descanso Automático',
      studentFeedback: 'Feedback do Aluno',
      createWorkoutTitle: 'Criar Treino',
      createTemplateTitle: 'Criar Modelo de Treino',
      workoutNameLabel: 'Designação do Plano',
      workoutNamePlaceholder: 'Ex: Treino A - Peito e Tríceps',
      descriptionLabel: 'Descrição ou Observações',
      descriptionPlaceholder: 'Ex: Aquecer 5 min, descanso estrito de 90s',
      categoryLabel: 'Categoria do Plano',
      saveAndAddExercises: 'Guardar e Adicionar Exercícios',
      createTemplateAndAddExercises: 'Criar Modelo e Adicionar Exercícios',
      addExerciseTitle: 'Adicionar Exercício',
      editExerciseTitle: 'Editar Exercício',
      exerciseName: 'Designação do Exercício',
      exerciseNamePlaceholder: 'Ex: Supino Reto com Barra',
      setsLabel: 'Séries',
      repsLabel: 'Repetições',
      weightLabel: 'Carga / Peso (kg)',
      restSecondsLabel: 'Descanso (segundos)',
      notesLabel: 'Notas e Instruções Técnicas',
      notesPlaceholder: 'Ex: Foco na fase excêntrica, 3 segundos de descida',
      saveExercise: 'Guardar Exercício',
      aiWorkoutTitle: 'Treino com IA',
      aiCoachSubtitle: 'Cria um plano de treino personalizado para prescrever ao teu aluno.',
      aiClientSubtitle: 'Descreve a sessão pretendida. Exemplo: Treino de 45 minutos focado em pernas e glúteos.',
      aiPromptLabel: 'O que pretendes no treino?',
      aiPromptPlaceholder: 'Ex: Peito e tríceps, 4 exercícios, foco em hipertrofia e força...',
      generateWorkoutBtn: 'Gerar Treino',
      generatingWorkout: 'A criar o plano com IA...',
      record: 'Recorde',
      set: 'Série',
      restBetweenSets: 'Descanso entre Séries',
      restCompleted: 'Descanso concluído. Iniciar próxima série.',
      prescribedExercises: 'Exercícios Prescritos',
      addExercise: 'Adicionar Exercício',
      noExercises: 'Este plano ainda não possui exercícios adicionados.',
      sessionNotes: 'Observações da Sessão (Opcional)',
      sessionNotesPlaceholder: 'Registo de cansaço, dores musculares ou ajustes efetuados...',
      deleteWorkoutConfirm: 'Pretende apagar este treino e todos os seus exercícios?',
      deleteExerciseConfirm: 'Remover "{name}" deste treino?',
      removeExerciseTitle: 'Remover Exercício',
      workoutFinishedTitle: 'Sessão Concluída',
      workoutFinishedMsg: 'Treino de {duration} minutos registado com sucesso.',
      nameRequiredAlert: 'Por favor introduza a designação do plano.',
      assignWorkoutSubtitle: 'Cria um plano individual para este aluno. Poderás prescrever os exercícios a seguir.',
      createWorkoutSubtitle: 'Dá um nome ao teu treino. Poderás adicionar os exercícios no passo seguinte.',
      createTemplateSubtitle: 'Cria um modelo reutilizável para a tua biblioteca. Poderás adicionar exercícios a seguir.',
      catHypertrophy: 'Hipertrofia',
      catStrength: 'Força',
      catFatLoss: 'Perda de Gordura',
      catFullBody: 'Full Body',
      catConditioning: 'Condicionamento',
      aiDescribeWorkoutTitle: 'Descreve o teu treino',
      aiDescribeWorkoutMsg: 'Diz à IA o que procuras (ex: Treino de hipertrofia de peito com 4 exercícios).',
      aiGeneratedDefault: 'Gerado com Inteligência Artificial',
      aiWorkoutCreatedTitle: 'Treino Criado!',
      aiWorkoutAssignedSuccess: 'O treino foi atribuído ao teu aluno com sucesso.',
      aiWorkoutReadySuccess: 'O teu plano está pronto no teu painel.',
      aiFailedTitle: 'Falha na IA',
      aiFailedMsg: 'Tenta um pedido mais específico ou direto.',
      requiredFieldsTitle: 'Campos Obrigatórios',
      requiredFieldsAlert: 'Nome, séries e repetições são obrigatórios.',
      suggestedWeight: 'Carga Sugerida (kg)',
      targetSets: 'Séries Alvo',
      executionNotes: 'Instruções de Postura e Execução (Opcional)',
      executionNotesPlaceholder: 'Ex: Cadência controlada 3s excêntrica, amplitude total.',
      addToPlan: 'Adicionar ao Plano',
      previous: 'Anterior',
      noPrevious: 'Sem registo',
      setTypeNormal: 'Normal',
      setTypeWarmup: 'Aquecimento',
      setTypeDropset: 'Drop-set',
      setTypeFailure: 'Falha',
      timerVibrated: 'Descanso concluído! Hora da próxima série.',
      selectFromLibrary: 'Escolher da Biblioteca',
      searchExercise: 'Pesquisar exercício...',
      catAll: 'Todos',
      catChest: 'Peito',
      catBack: 'Costas',
      catLegs: 'Pernas',
      catShoulders: 'Ombros',
      catArms: 'Braços',
      catCore: 'Abdominais',
      equipment: 'Equipamento',
      instructions: 'Instruções de Execução',
      fillFromExercise: 'Usar este exercício',
      lastSession: 'Última sessão',
      repShort: 'reps',
    },
    nutrition: {
      title: 'Nutrição',
      subtitle: 'Registo diário de calorias, macronutrientes e análise por IA.',
      dailyGoals: 'Metas Nutricionais e Frequência',
      dailyGoal: 'Meta Diária',
      calories: 'Calorias (kcal)',
      protein: 'Proteína (g)',
      carbs: 'Hidratos (g)',
      fat: 'Gordura (g)',
      adjustGoals: 'Ajustar Metas',
      registeredMeals: 'Refeições Registadas Hoje',
      todayMeals: 'Refeições Registadas Hoje',
      logMeal: 'Registar Refeição',
      mealName: 'Nome da refeição',
      noMeals: 'Nenhuma refeição registada.',
      noMealsToday: 'Nenhuma refeição registada hoje. Fotografa o teu prato para começar.',
      scanMeal: 'Fotografar Prato',
      galleryMeal: 'Escolher da Galeria',
      analyzingFood: 'A analisar fotografia do prato com Inteligência Artificial...',
      nutritionEstimate: 'Estimativa Nutricional',
      discard: 'Descartar',
      saveMeal: 'Guardar Refeição',
      todayTotal: 'Total de Hoje',
      cannotAnalyze: 'Não foi possível analisar',
      cannotAnalyzeTips: 'Fotografa o prato com boa iluminação e enquadramento.',
    },
    assessment: {
      title: 'Avaliação Corporal',
      newAssessment: 'Nova Avaliação',
      weight: 'Peso (kg)',
      bodyFat: 'Gordura (% BF)',
      chest: 'Peitoral (cm)',
      waist: 'Cintura (cm)',
      arms: 'Braço (cm)',
      thighs: 'Coxa (cm)',
      evolutionPhoto: 'Fotografia de Evolução',
      takeOrUploadPhoto: 'Carregar Fotografia de Avaliação',
      removePhoto: 'Remover Fotografia',
      technicalNotes: 'Notas e Observações Clínicas',
      noAssessments: 'Nenhuma avaliação corporal registada.',
      saveAssessment: 'Registar Avaliação',
    },
    subscription: {
      proBadge: 'FIT COACH PRO',
      proTitle: 'Plano Profissional',
      trialExpiredTitle: 'Período de Avaliação Terminado',
      trialExpiredDesc: 'O teu período de avaliação de 14 dias terminou. Ativa a tua subscrição para desbloquear o acesso total a todos os teus alunos.',
      activeDesc: 'Eleva a tua gestão de atletas com todas as ferramentas de treino e retenção.',
      trialingDesc: 'Aproveita o teu teste de 14 dias sem compromisso antes de iniciar a mensalidade.',
      pricePerMonth: '19,99 € / mês',
      cancelAnytime: 'Sem fidelização  ·  Cancela quando quiseres',
      activateStripe: 'Ativar Subscrição com Stripe',
      activateDemo: 'Ativar Modo de Demonstração (Simular Pagamento)',
      manageBilling: 'Gerir Faturação / Cartão',
      logout: 'Terminar Sessão',
      daysLeftTrial: 'dias de teste restantes',
      statusActive: 'Ativa',
      statusExpired: 'Expirada',
      statusTrial: 'Período de Teste',
      featureUnlimitedStudents: 'Gestão ilimitada de alunos e fichas clínicas',
      featureTemplates: 'Biblioteca e prescrição direta de modelos de treino',
      featureNutrition: 'Prescrição de calorias e macronutrientes personalizados',
      featureAssessments: 'Avaliações físicas completas e fotografias de evolução',
      featureAI: 'Criação acelerada de treinos com Inteligência Artificial',
      featureRetention: 'Painel anti-churn com alertas de abandono de alunos',
      noStripeKeyPrompt: 'A chave de API do Stripe não foi detetada no servidor. Pretende ativar a subscrição através do simulador de desenvolvimento?',
    },
    profile: {
      title: 'O Teu Perfil',
      name: 'Nome',
      placeholderName: 'O teu nome',
      settingsAndAppearance: 'Definições e Aparência',
      themeSub: 'Personaliza o tema e o idioma da tua aplicação.',
      themeTitle: 'Tema Visual',
      themeDark: 'Escuro',
      themeLight: 'Claro',
      languageTitle: 'Idioma da Aplicação',
      yourCoach: 'O Teu Personal Trainer',
      coachCodeDesc: 'Tens um treinador a acompanhar-te? Insere o código fornecido pelo teu PT:',
      linkBtn: 'Associar',
      weeklyGoalTitle: 'Meta Semanal',
      weeklyGoalSub: 'Quantas sessões planeias treinar por semana?',
      weeklySessions: 'sessões',
      saveGoalBtn: 'Guardar Meta',
      weightLogTitle: 'Registo de Peso Corporal',
      weightLogSub: 'Acompanha a tua evolução ao longo do tempo.',
      logWeightBtn: 'Registar',
      subCoachTitle: 'Subscrição Fit Coach Pro',
      subCoachSub: 'Gestão da conta de Personal Trainer',
      subActiveDesc: 'Tens acesso profissional total sem limites de alunos ou prescrições.',
      subExpiredDesc: 'O teu período de teste terminou. As funcionalidades de treinador estão suspensas.',
      subTrialDesc: 'Aproveita o teu teste de 14 dias sem compromisso antes de iniciar a mensalidade.',
      manageBillingStripe: 'Gerir Faturação no Stripe',
      subscribePlanPrice: 'Subscrever Plano (19,99 €/mês)',
      devToolsTitle: 'Ferramentas de Simulação (Testes):',
      simulateActivation: 'Simular Ativação',
      simulateExpiry: 'Simular Expiração',
      switchRoleBtn: 'Alternar Papel',
      switchToClient: 'Mudar Modo para Aluno (Cliente)',
      switchToCoach: 'Mudar Modo para Personal Trainer',
      logoutBtn: 'Terminar Sessão',
      errorLoadingImage: 'Não foi possível carregar a imagem de perfil.',
      nameRequired: 'Nome obrigatório',
      nameRequiredMsg: 'Por favor insere um nome válido.',
      goalSavedSuccess: 'Objetivo semanal atualizado com sucesso.',
      invalidWeightMsg: 'Por favor introduz um valor numérico válido.',
      enterInviteCodePrompt: 'Insere o código de convite fornecido pelo teu treinador.',
      linkedCoachSuccess: 'Associado ao teu treinador com sucesso!',
      switchRoleTitle: 'Alternar Papel',
      switchRoleConfirm: 'Pretendes mudar a tua conta para {role}?',
      switchRoleSuccess: 'Agora estás no modo {role}!',
      devSubscriptionActivated: 'Subscrição profissional ativada com sucesso em modo de demonstração.',
      devModeTitle: 'Modo de Teste',
      devTrialExpired: 'Período experimental expirado. Todas as funcionalidades de treinador estão agora bloqueadas pela paywall.',
      stripePortal: 'Portal Stripe',
      saveChanges: 'Guardar Alterações',
    },
    clientDetails: {
      studentFile: 'Ficha do Aluno',
      currentWeight: 'Peso Atual',
      currentStreak: 'Streak Atual',
      weeklyGoal: 'Meta Semanal',
      tabWorkouts: 'Treinos',
      tabHistory: 'Histórico',
      tabNutrition: 'Nutrição',
      tabAssessment: 'Avaliação',
      prescribedPlans: 'Planos Prescritos',
      assignWorkout: 'Atribuir Treino',
      exercisesCount: 'exercícios',
      noWorkoutsAssigned: 'Ainda não prescreveste nenhum treino a este aluno.',
      prescribeFirst: 'Prescrever Primeiro Treino',
      selectAssignMethod: 'Selecione o método de prescrição pretendido:',
      fromTemplate: 'A partir de Modelo',
      withAI: 'Gerador com Inteligência Artificial',
      createManually: 'Criar Manualmente',
      adjustGoals: 'Metas do Aluno',
      dailyCalories: 'Calorias Diárias (kcal)',
      dailyProtein: 'Proteína (g)',
      dailyCarbs: 'Hidratos de Carbono (g)',
      dailyFat: 'Gordura (g)',
      weeklySessions: 'Meta Semanal de Treinos',
      saveGoals: 'Guardar Metas',
      newAssessment: 'Nova Avaliação Corporal',
      evolutionPhoto: 'Fotografia de Evolução',
      takeOrPickPhoto: 'Carregar Fotografia',
      removePhoto: 'Remover Fotografia',
      technicalNotes: 'Notas e Observações Clínicas',
      recordAssessment: 'Registar Avaliação',
      removeStudent: 'Remover Aluno',
      confirmRemoveStudent: 'Tens a certeza que pretendes desassociar este aluno?',
      latestWeight: 'Peso Atual',
      nutritionAndGoalsTitle: 'Metas Nutricionais e Frequência',
      nutritionAndGoalsSub: 'Prescrição personalizada para este aluno',
      adjust: 'Ajustar',
      selectTemplateSub: 'Selecione um plano para prescrever ao aluno',
      assignTemplateTitle: 'Atribuir Modelo',
      assignTemplateConfirm: 'Deseja atribuir o plano "{template}" ao aluno {name}?',
      assignTemplateSuccess: 'Plano "{template}" atribuído com sucesso.',
      studentRemovedSuccess: 'Aluno removido com sucesso.',
      modalGoalsTitle: 'Metas do Aluno',
      modalGoalsSub: 'Configurar objetivos nutricionais e frequência',
      modalAssessmentSub: 'Registar peso, perímetros e fotografia',
      bodyPerimeters: 'Perímetros Corporais (cm)',
      weightRequiredAlert: 'O peso corporal é obrigatório para registar a avaliação.',
      assessmentSavedSuccess: 'Avaliação corporal registada com sucesso.',
      goalsSavedSuccess: 'Metas nutricionais e de frequência atualizadas com sucesso.',
      noFinishedWorkouts: 'O aluno ainda não registou nenhum treino finalizado.',
      noMealsRecorded: 'Nenhuma refeição registada por este aluno.',
      weeksCount: 'sem',
      perWeek: 'dias',
    },
    templates: {
      title: 'Modelos de Treino',
      subtitle: 'Cria planos padrão para prescrever rapidamente aos teus alunos.',
      createTemplate: 'Criar Novo Modelo',
      emptyTitle: 'Ainda não tens modelos criados',
      emptyDesc: 'Cria modelos de treino (ex: Hipertrofia A/B, Full Body Iniciante) para prescrever a alunos com 1 clique.',
      deleteTemplateConfirm: 'Tens a certeza que pretendes eliminar este modelo?',
    },
    history: {
      title: 'Histórico de Treinos',
      subtitle: 'Registo de todas as tuas sessões concluídas e evolução.',
      noLogs: 'Ainda não concluíste nenhum treino. Inicia uma sessão no teu painel.',
      exportCSV: 'Exportar para CSV',
      shareWorkout: 'Partilhar Treino',
      noDataToExport: 'Ainda não existem treinos registados para exportação.',
      workoutCompletedShare: 'Concluí o treino "{workoutName}" ({duration} min) na plataforma Fit Coach Hub.',
      workoutCompletedDefault: 'Treino Concluído',
      noData: 'Sem dados',
      csvExportError: 'Não foi possível gerar o relatório CSV.',
      shareNotAvailable: 'A partilha de ficheiros não está disponível neste dispositivo.',
    },
    invite: {
      title: 'Convidar Aluno',
      desc: 'Gera um código de associação de 4 dígitos para partilhar com o teu novo aluno.',
      codeLabel: 'CÓDIGO DE ATIVAÇÃO',
      validFor: 'Válido durante 48 horas',
      shareBtn: 'Partilhar Código',
      generateBtn: 'Gerar Código de Convite',
      shareMessage: 'Acesso aos planos de treino e acompanhamento na app Fit Coach Hub.\n\nCódigo de ativação: {code}\nInsira este código na aplicação para iniciar o acompanhamento.',
    },
    analytics: {
      chartsTitle: 'Gráficos de Evolução',
      chartsSubtitle: 'Visualiza o teu progresso de peso e força ao longo do tempo.',
      coachChartsSubtitle: 'Visualiza a progressão do peso e o 1RM estimado das principais cargas do teu aluno.',
      weightEvolution: 'Evolução do Peso Corporal',
      weightEmptyPrompt: 'Regista o teu peso ou faz check-in semanal para desenhar o gráfico.',
      strengthEvolution: 'Carga Máxima & 1RM',
      strengthEmptyPrompt: 'Sem sessões concluídas com carga para este exercício.',
      estimated1RM: '1RM Estimado',
      noSessionsCompleted: 'Sem sessões concluídas para este exercício.',
      noChartData: 'Sem dados suficientes para apresentar o gráfico.',
    },
    checkin: {
      title: 'Check-in Semanal',
      bannerSubtitle: 'Regista o teu peso em jejum, fotos e notas para o teu treinador',
      tabTitle: 'Check-ins',
      emptyTitle: 'Sem check-ins submetidos',
      emptyText: 'O teu aluno ainda não submeteu nenhum check-in semanal. Envia-lhe uma notificação para o incentivar!',
      sendPushBtn: 'Enviar Notificação 🔔',
      prescribedByCoach: 'Prescrito pelo teu Treinador',
      painAlert: 'Alerta de Dor / Lesão Assinalada',
      feedbackTitle: 'Feedback Semanal do Treinador',
      feedbackPlaceholder: 'Escreve aqui o feedback da semana para o teu aluno...',
      sendFeedbackBtn: 'Enviar Feedback ao Aluno 🚀',
      feedbackSentSuccess: 'Feedback enviado com sucesso!',
    },
    exerciseGuide: {
      title: 'Guia de Execução & Postura',
      targetMuscles: 'Músculos Alvo',
      setupTitle: 'Posicionamento Inicial',
      executionTitle: 'Execução & Respiração',
      mistakesTitle: 'Erros Comuns a Evitar',
      videoDemoTitle: 'Demonstração em Vídeo',
      watchOnYoutube: 'Ver Execução no YouTube 🎥',
      editVideoUrl: 'Personalizar Vídeo/GIF do Exercício',
      saveVideoUrl: 'Guardar Link de Vídeo',
      videoUrlPlaceholder: 'URL do vídeo (ex: YouTube, Vimeo, MP4, GIF)...',
      videoUrlSaved: 'Link de vídeo guardado com sucesso!',
    },
    substituteExercise: {
      modalTitle: 'Substituir Exercício',
      modalSubtitle: 'A máquina está ocupada? Escolhe um exercício equivalente sem perder o estímulo:',
      searchPlaceholder: 'Pesquisar exercício alternativo...',
      recommendedEquivalents: 'Equivalentes Recomendados (Mesmo Grupo Muscular)',
      allEquivalents: 'Todos os Exercícios Alternativos',
      confirmSwapTitle: 'Substituir Exercício',
      confirmSwapMessage: 'Desejas substituir "{oldName}" por "{newName}" neste treino?',
      swapSuccess: 'Exercício substituído com sucesso!',
      sameGroupTag: 'Equivalente',
      dumbbellAltTag: 'Com Halteres',
      cableAltTag: 'Em Cabos',
      machineAltTag: 'Em Máquina',
    },
  },

  en: {
    common: {
      save: 'Save',
      saving: 'Saving...',
      cancel: 'Cancel',
      delete: 'Delete',
      back: 'Back',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      confirm: 'Confirm',
      edit: 'Edit',
      close: 'Close',
      remove: 'Remove',
      yes: 'Yes',
      no: 'No',
      discard: 'Discard',
      attention: 'Attention',
      status: 'Status',
    },
    auth: {
      appTitle: 'Fit Coach Hub',
      appSubtitle: 'Platform for Personal Trainers to manage clients, workouts, and progress.',
      loginAs: 'Sign in as:',
      coach: 'Personal Trainer',
      client: 'Trainee / Client',
      continueGoogle: 'Continue with Google',
      devSectionTitle: 'Quick Test Mode (Without Google)',
      devCoachBtn: 'Sign in as Coach (PT)',
      devClientBtn: 'Sign in as Client',
    },
    dashboard: {
      hello: 'Hello',
      roleCoach: 'Personal Trainer',
      roleClient: 'Trainee',
      weeklyGoal: 'Weekly Goal',
      currentStreak: 'Current Streak',
      sessions: 'sessions',
      myStudents: 'My Students',
      inviteStudent: '+ Invite Student',
      templates: 'Templates',
      createWorkout: 'Create Workout',
      aiGenerator: 'AI Generator',
      alertsTitle: 'Follow-up Alerts',
      alertsSubtitle: 'Students requiring contact to prevent churn:',
      inactiveFor: 'Inactive for',
      noStudents: 'No students associated yet',
      emptyInviteBtn: '+ Generate Invite Code',
      todayWorkout: 'Your Workout',
      startWorkout: 'Start Workout',
      workoutsCompleted: 'workouts completed',
      activeClients: 'Active Students',
      clientWorkoutsWeek: 'Student Workouts (Week)',
      workoutsCompletedClient: 'Workouts Completed',
      trainingTime: 'Training Time',
      thisWeek: 'This week',
      weeksInARow: 'weeks in a row',
      noWorkoutsAssigned: 'You have no workouts assigned yet. Your coach will assign plans soon.',
      assignedWorkouts: 'Your Assigned Workouts',
      nutritionAndPhotos: 'Nutrition & Photos',
      history: 'History',
      metricsWeight: 'Weight / Metrics',
      myDashboard: 'Your Dashboard',
      yourCoach: 'Your Personal Trainer',
      startWeekCopy: 'Start the week with a workout session.',
      remainingWorkouts: '{count} workout(s) left this week.',
      goalMetCopy: 'Weekly goal accomplished! Great job.',
      goalMet: 'Goal met',
      noWorkoutsYet: 'No workouts',
      workoutsThisWeek: 'workouts this week',
      lastWorkoutDays: 'Last workout {days} days ago',
      notStartedYet: 'Has not started prescribed plan yet',
      proSubscriptionActive: 'Fit Coach Pro Active',
      proSubscriptionTitle: 'Personal Trainer Plan',
      proAccessDesc: 'Unlimited professional access. Tap to manage billing.',
      trialDaysLeftDesc: 'Trial period: {days} days left. Tap to subscribe.',
      trialActiveDesc: 'Free trial active. Tap to subscribe.',
      assignedByCoach: 'Assigned by Coach {name}',
      individualPlan: 'Individual workout plan',
    },
    workouts: {
      title: 'Workouts',
      prescribedWorkouts: 'Prescribed Plans',
      assignWorkout: 'Assign Workout',
      assignFromTemplate: 'From Template',
      createManually: 'Create Manually',
      generateWithAI: 'Generate with AI',
      exercisesCount: 'exercises',
      sets: 'sets',
      reps: 'reps',
      weight: 'weight',
      rest: 'rest',
      notes: 'notes',
      startWorkout: 'Start Workout',
      finishWorkout: 'Complete Session',
      finishSession: 'Complete Session',
      cloneWorkout: 'Duplicate Workout',
      deleteWorkout: 'Delete Workout',
      restTimer: 'Rest Timer',
      studentFeedback: 'Student Feedback',
      createWorkoutTitle: 'Create Workout',
      createTemplateTitle: 'Create Workout Template',
      workoutNameLabel: 'Workout Name',
      workoutNamePlaceholder: 'e.g. Workout A - Chest & Triceps',
      descriptionLabel: 'Description or Instructions',
      descriptionPlaceholder: 'e.g. 5 min warmup, strict 90s rest',
      categoryLabel: 'Plan Category',
      saveAndAddExercises: 'Save & Add Exercises',
      createTemplateAndAddExercises: 'Create Template & Add Exercises',
      addExerciseTitle: 'Add Exercise',
      editExerciseTitle: 'Edit Exercise',
      exerciseName: 'Exercise Name',
      exerciseNamePlaceholder: 'e.g. Barbell Bench Press',
      setsLabel: 'Sets',
      repsLabel: 'Reps',
      weightLabel: 'Load / Weight (kg)',
      restSecondsLabel: 'Rest (seconds)',
      notesLabel: 'Notes & Technical Cues',
      notesPlaceholder: 'e.g. Focus on eccentric phase, 3s descent',
      saveExercise: 'Save Exercise',
      aiWorkoutTitle: 'AI Workout',
      aiCoachSubtitle: 'Create a custom workout plan to prescribe to your student.',
      aiClientSubtitle: 'Describe the desired session. E.g. 45-minute workout focused on legs and glutes.',
      aiPromptLabel: 'What do you want in the workout?',
      aiPromptPlaceholder: 'e.g. Chest and triceps, 4 exercises, focus on hypertrophy and strength...',
      generateWorkoutBtn: 'Generate Workout',
      generatingWorkout: 'Creating plan with AI...',
      record: 'Record',
      set: 'Set',
      restBetweenSets: 'Rest between Sets',
      restCompleted: 'Rest completed. Start next set.',
      prescribedExercises: 'Prescribed Exercises',
      addExercise: 'Add Exercise',
      noExercises: 'This plan does not have any exercises added yet.',
      sessionNotes: 'Session Notes (Optional)',
      sessionNotesPlaceholder: 'Notes on fatigue, muscle soreness, or adjustments made...',
      deleteWorkoutConfirm: 'Are you sure you want to delete this workout and all its exercises?',
      deleteExerciseConfirm: 'Remove "{name}" from this workout?',
      removeExerciseTitle: 'Remove Exercise',
      workoutFinishedTitle: 'Session Completed',
      workoutFinishedMsg: 'Workout of {duration} minutes recorded successfully.',
      nameRequiredAlert: 'Please enter the plan title.',
      assignWorkoutSubtitle: 'Create an individual plan for this student. You can prescribe exercises next.',
      createWorkoutSubtitle: 'Name your workout. You can add exercises in the next step.',
      createTemplateSubtitle: 'Create a reusable template for your library. You can add exercises next.',
      catHypertrophy: 'Hypertrophy',
      catStrength: 'Strength',
      catFatLoss: 'Fat Loss',
      catFullBody: 'Full Body',
      catConditioning: 'Conditioning',
      aiDescribeWorkoutTitle: 'Describe your workout',
      aiDescribeWorkoutMsg: 'Tell the AI what you want (e.g. 4-exercise chest hypertrophy session).',
      aiGeneratedDefault: 'Generated with Artificial Intelligence',
      aiWorkoutCreatedTitle: 'Workout Created!',
      aiWorkoutAssignedSuccess: 'The workout was successfully assigned to your student.',
      aiWorkoutReadySuccess: 'Your workout plan is ready on your dashboard.',
      aiFailedTitle: 'AI Generation Failed',
      aiFailedMsg: 'Please try a more specific or direct prompt.',
      requiredFieldsTitle: 'Required Fields',
      requiredFieldsAlert: 'Name, sets, and reps are required.',
      suggestedWeight: 'Suggested Weight (kg)',
      targetSets: 'Target Sets',
      executionNotes: 'Posture & Execution Instructions (Optional)',
      executionNotesPlaceholder: 'e.g. 3s controlled eccentric tempo, full range of motion.',
      addToPlan: 'Add to Plan',
      previous: 'Previous',
      noPrevious: 'No record',
      setTypeNormal: 'Normal',
      setTypeWarmup: 'Warmup',
      setTypeDropset: 'Drop-set',
      setTypeFailure: 'Failure',
      timerVibrated: 'Rest completed! Time for the next set.',
      selectFromLibrary: 'Select from Library',
      searchExercise: 'Search exercise...',
      catAll: 'All',
      catChest: 'Chest',
      catBack: 'Back',
      catLegs: 'Legs',
      catShoulders: 'Shoulders',
      catArms: 'Arms',
      catCore: 'Abs & Core',
      equipment: 'Equipment',
      instructions: 'Execution Instructions',
      fillFromExercise: 'Use this exercise',
      lastSession: 'Last session',
      repShort: 'reps',
    },
    nutrition: {
      title: 'Nutrition',
      subtitle: 'Daily tracking of calories, macronutrients, and AI analysis.',
      dailyGoals: 'Nutritional Goals & Frequency',
      dailyGoal: 'Daily Goal',
      calories: 'Calories (kcal)',
      protein: 'Protein (g)',
      carbs: 'Carbs (g)',
      fat: 'Fat (g)',
      adjustGoals: 'Adjust Goals',
      registeredMeals: 'Meals Logged Today',
      todayMeals: 'Meals Logged Today',
      logMeal: 'Log Meal',
      mealName: 'Meal name',
      noMeals: 'No meals registered.',
      noMealsToday: 'No meals logged today. Snap a photo of your plate to start.',
      scanMeal: 'Scan Meal',
      galleryMeal: 'Choose from Gallery',
      analyzingFood: 'Analyzing meal photo with Artificial Intelligence...',
      nutritionEstimate: 'Nutritional Estimate',
      discard: 'Discard',
      saveMeal: 'Save Meal',
      todayTotal: 'Today\'s Total',
      cannotAnalyze: 'Could not analyze',
      cannotAnalyzeTips: 'Photograph the dish with good lighting and framing.',
    },
    assessment: {
      title: 'Body Assessment',
      newAssessment: 'New Assessment',
      weight: 'Weight (kg)',
      bodyFat: 'Body Fat (% BF)',
      chest: 'Chest (cm)',
      waist: 'Waist (cm)',
      arms: 'Arms (cm)',
      thighs: 'Thighs (cm)',
      evolutionPhoto: 'Progress Photo',
      takeOrUploadPhoto: 'Upload Assessment Photo',
      removePhoto: 'Remove Photo',
      technicalNotes: 'Clinical Notes & Observations',
      noAssessments: 'No body assessments recorded.',
      saveAssessment: 'Save Assessment',
    },
    subscription: {
      proBadge: 'FIT COACH PRO',
      proTitle: 'Professional Plan',
      trialExpiredTitle: 'Trial Period Ended',
      trialExpiredDesc: 'Your 14-day trial period has ended. Activate your subscription to unlock full access to all your students.',
      activeDesc: 'Elevate your athlete management with all workout and retention tools.',
      trialingDesc: 'Enjoy your 14-day risk-free trial before starting your subscription.',
      pricePerMonth: '19.99 € / month',
      cancelAnytime: 'No commitment  ·  Cancel anytime',
      activateStripe: 'Activate Subscription with Stripe',
      activateDemo: 'Activate Demo Mode (Simulate Payment)',
      manageBilling: 'Manage Billing / Card',
      logout: 'Sign Out',
      daysLeftTrial: 'trial days remaining',
      statusActive: 'Active',
      statusExpired: 'Expired',
      statusTrial: 'Trial Period',
      featureUnlimitedStudents: 'Unlimited students & medical records',
      featureTemplates: 'Workout template library & instant prescription',
      featureNutrition: 'Personalized calories & macronutrient targets',
      featureAssessments: 'Full body assessments & progress photos',
      featureAI: 'Accelerated workout creation with Artificial Intelligence',
      featureRetention: 'Anti-churn retention panel with inactive student alerts',
      noStripeKeyPrompt: 'Stripe API key is not configured on the server. Would you like to activate the subscription using the development simulator?',
    },
    profile: {
      title: 'Your Profile',
      name: 'Name',
      placeholderName: 'Your name',
      settingsAndAppearance: 'Settings & Appearance',
      themeSub: 'Customize your app theme and language.',
      themeTitle: 'Visual Theme',
      themeDark: 'Dark',
      themeLight: 'Light',
      languageTitle: 'App Language',
      yourCoach: 'Your Personal Trainer',
      coachCodeDesc: 'Do you have a personal trainer? Enter the 4-digit code provided by your coach:',
      linkBtn: 'Link',
      weeklyGoalTitle: 'Weekly Goal',
      weeklyGoalSub: 'How many sessions do you plan to train per week?',
      weeklySessions: 'sessions',
      saveGoalBtn: 'Save Goal',
      weightLogTitle: 'Body Weight Log',
      weightLogSub: 'Track your progress over time.',
      logWeightBtn: 'Log',
      subCoachTitle: 'Fit Coach Pro Subscription',
      subCoachSub: 'Personal Trainer account management',
      subActiveDesc: 'You have full professional access with no limits on students or plans.',
      subExpiredDesc: 'Your trial period has ended. Coach features are currently suspended.',
      subTrialDesc: 'Enjoy your 14-day trial with no commitment before starting your monthly plan.',
      manageBillingStripe: 'Manage Billing on Stripe',
      subscribePlanPrice: 'Subscribe Plan (€19.99/month)',
      devToolsTitle: 'Developer Simulation Tools:',
      simulateActivation: 'Simulate Activation',
      simulateExpiry: 'Simulate Expiry',
      switchRoleBtn: 'Switch Role',
      switchToClient: 'Switch Mode to Trainee (Client)',
      switchToCoach: 'Switch Mode to Personal Trainer',
      logoutBtn: 'Sign Out',
      errorLoadingImage: 'Could not upload profile picture.',
      nameRequired: 'Name is required',
      nameRequiredMsg: 'Please enter a valid name.',
      goalSavedSuccess: 'Weekly goal updated successfully.',
      invalidWeightMsg: 'Please enter a valid numeric weight.',
      enterInviteCodePrompt: 'Enter the invite code provided by your trainer.',
      linkedCoachSuccess: 'Successfully linked to your trainer!',
      switchRoleTitle: 'Switch Role',
      switchRoleConfirm: 'Do you want to switch your account to {role}?',
      switchRoleSuccess: 'You are now in {role} mode!',
      devSubscriptionActivated: 'Pro subscription successfully activated in demo mode.',
      devModeTitle: 'Test Mode',
      devTrialExpired: 'Trial period expired. All coach features are now paywall protected.',
      stripePortal: 'Stripe Portal',
      saveChanges: 'Save Changes',
    },
    clientDetails: {
      studentFile: 'Student File',
      currentWeight: 'Current Weight',
      currentStreak: 'Current Streak',
      weeklyGoal: 'Weekly Goal',
      tabWorkouts: 'Workouts',
      tabHistory: 'History',
      tabNutrition: 'Nutrition',
      tabAssessment: 'Assessment',
      prescribedPlans: 'Prescribed Plans',
      assignWorkout: 'Assign Workout',
      exercisesCount: 'exercises',
      noWorkoutsAssigned: 'You haven\'t assigned any workouts to this student yet.',
      prescribeFirst: 'Prescribe First Workout',
      selectAssignMethod: 'Select desired assignment method:',
      fromTemplate: 'From Template',
      withAI: 'AI Generator',
      createManually: 'Create Manually',
      adjustGoals: 'Student Goals',
      dailyCalories: 'Daily Calories (kcal)',
      dailyProtein: 'Protein (g)',
      dailyCarbs: 'Carbs (g)',
      dailyFat: 'Fat (g)',
      weeklySessions: 'Weekly Workout Sessions',
      saveGoals: 'Save Goals',
      newAssessment: 'New Body Assessment',
      evolutionPhoto: 'Progress Photo',
      takeOrPickPhoto: 'Upload Photo',
      removePhoto: 'Remove Photo',
      technicalNotes: 'Clinical Notes & Observations',
      recordAssessment: 'Record Assessment',
      removeStudent: 'Remove Student',
      confirmRemoveStudent: 'Are you sure you want to remove this student?',
      latestWeight: 'Current Weight',
      nutritionAndGoalsTitle: 'Nutritional & Training Goals',
      nutritionAndGoalsSub: 'Personalized prescription for this student',
      adjust: 'Adjust',
      selectTemplateSub: 'Select a plan to assign to this student',
      assignTemplateTitle: 'Assign Template',
      assignTemplateConfirm: 'Do you want to assign the plan "{template}" to student {name}?',
      assignTemplateSuccess: 'Plan "{template}" assigned successfully.',
      studentRemovedSuccess: 'Student removed successfully.',
      modalGoalsTitle: 'Student Goals',
      modalGoalsSub: 'Configure nutritional goals and frequency',
      modalAssessmentSub: 'Record weight, body measurements and photo',
      bodyPerimeters: 'Body Measurements (cm)',
      weightRequiredAlert: 'Body weight is required to record the assessment.',
      assessmentSavedSuccess: 'Body assessment recorded successfully.',
      goalsSavedSuccess: 'Nutritional and frequency goals updated successfully.',
      noFinishedWorkouts: 'The student has not recorded any completed workouts yet.',
      noMealsRecorded: 'No meals recorded by this student.',
      weeksCount: 'wks',
      perWeek: 'days',
    },
    templates: {
      title: 'Workout Templates',
      subtitle: 'Create standard plans to quickly assign to your students.',
      createTemplate: 'Create New Template',
      emptyTitle: 'No templates created yet',
      emptyDesc: 'Create workout templates (e.g. Hypertrophy A/B, Beginner Full Body) to assign in 1 click.',
      deleteTemplateConfirm: 'Are you sure you want to delete this template?',
    },
    history: {
      title: 'Workout History',
      subtitle: 'Record of all your completed sessions and progress.',
      noLogs: 'You haven\'t completed any workouts yet. Start a session from your dashboard.',
      exportCSV: 'Export to CSV',
      shareWorkout: 'Share Workout',
      noDataToExport: 'No workout logs available to export yet.',
      workoutCompletedShare: 'I completed the "{workoutName}" workout ({duration} min) on Fit Coach Hub.',
      workoutCompletedDefault: 'Completed Workout',
      noData: 'No data',
      csvExportError: 'Could not generate CSV report.',
      shareNotAvailable: 'File sharing is not available on this device.',
    },
    invite: {
      title: 'Invite Student',
      desc: 'Generate a 4-digit activation code to share with your new student.',
      codeLabel: 'ACTIVATION CODE',
      validFor: 'Valid for 48 hours',
      shareBtn: 'Share Code',
      generateBtn: 'Generate Invite Code',
      shareMessage: 'Access workout plans and coaching on the Fit Coach Hub app.\n\nActivation code: {code}\nEnter this code in the app to start coaching.',
    },
    analytics: {
      chartsTitle: 'Evolution Charts',
      chartsSubtitle: 'Track your body weight and strength progression over time.',
      coachChartsSubtitle: "Track your student's weight progression and estimated 1RM for main lifts.",
      weightEvolution: 'Body Weight Evolution',
      weightEmptyPrompt: 'Log your weight or submit a weekly check-in to plot the chart.',
      strengthEvolution: 'Max Load & 1RM',
      strengthEmptyPrompt: 'No completed weighted sessions for this exercise.',
      estimated1RM: 'Estimated 1RM',
      noSessionsCompleted: 'No completed sessions for this exercise.',
      noChartData: 'Not enough data to display chart.',
    },
    checkin: {
      title: 'Weekly Check-in',
      bannerSubtitle: 'Log your fasting weight, photos, and notes for your coach',
      tabTitle: 'Check-ins',
      emptyTitle: 'No check-ins submitted',
      emptyText: "Your student hasn't submitted any weekly check-in yet. Send them a notification to encourage them!",
      sendPushBtn: 'Send Notification 🔔',
      prescribedByCoach: 'Prescribed by your Coach',
      painAlert: 'Pain / Injury Reported Alert',
      feedbackTitle: 'Coach Weekly Feedback',
      feedbackPlaceholder: 'Write weekly feedback for your student here...',
      sendFeedbackBtn: 'Send Feedback to Student 🚀',
      feedbackSentSuccess: 'Feedback sent successfully!',
    },
    exerciseGuide: {
      title: 'Execution & Posture Guide',
      targetMuscles: 'Target Muscles',
      setupTitle: 'Initial Setup',
      executionTitle: 'Execution & Breathing',
      mistakesTitle: 'Common Mistakes to Avoid',
      videoDemoTitle: 'Video Demonstration',
      watchOnYoutube: 'Watch on YouTube 🎥',
      editVideoUrl: 'Customize Exercise Video/GIF',
      saveVideoUrl: 'Save Video Link',
      videoUrlPlaceholder: 'Video URL (e.g. YouTube, Vimeo, MP4, GIF)...',
      videoUrlSaved: 'Video link saved successfully!',
    },
    substituteExercise: {
      modalTitle: 'Substitute Exercise',
      modalSubtitle: 'Is the machine taken? Pick an equivalent alternative without losing your training stimulus:',
      searchPlaceholder: 'Search alternative exercise...',
      recommendedEquivalents: 'Recommended Equivalents (Same Muscle Group)',
      allEquivalents: 'All Alternative Exercises',
      confirmSwapTitle: 'Substitute Exercise',
      confirmSwapMessage: 'Do you want to substitute "{oldName}" with "{newName}" in this workout?',
      swapSuccess: 'Exercise substituted successfully!',
      sameGroupTag: 'Equivalent',
      dumbbellAltTag: 'Dumbbells',
      cableAltTag: 'Cables',
      machineAltTag: 'Machine',
    },
  },

  es: {
    common: {
      save: 'Guardar',
      saving: 'Guardando...',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      back: 'Volver',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      confirm: 'Confirmar',
      edit: 'Editar',
      close: 'Cerrar',
      remove: 'Eliminar',
      yes: 'Sí',
      no: 'No',
      discard: 'Descartar',
      attention: 'Atención',
      status: 'Estado',
    },
    auth: {
      appTitle: 'Fit Coach Hub',
      appSubtitle: 'Plataforma para Entrenadores Personales para gestionar clientes, entrenamientos y evolución.',
      loginAs: 'Iniciar sesión como:',
      coach: 'Entrenador Personal',
      client: 'Alumno / Cliente',
      continueGoogle: 'Continuar con Google',
      devSectionTitle: 'Modo de Prueba Rápida (Sin Google)',
      devCoachBtn: 'Entrar como Entrenador (PT)',
      devClientBtn: 'Entrar como Alumno (Cliente)',
    },
    dashboard: {
      hello: 'Hola',
      roleCoach: 'Entrenador Personal',
      roleClient: 'Alumno',
      weeklyGoal: 'Meta Semanal',
      currentStreak: 'Racha Actual',
      sessions: 'sesiones',
      myStudents: 'Mis Alumnos',
      inviteStudent: '+ Invitar Alumno',
      templates: 'Plantillas',
      createWorkout: 'Crear Rutina',
      aiGenerator: 'Generador IA',
      alertsTitle: 'Alertas de Seguimiento',
      alertsSubtitle: 'Alumnos que necesitan contacto para prevenir abandono:',
      inactiveFor: 'Inactivo hace',
      noStudents: 'Aún no tienes alumnos asociados',
      emptyInviteBtn: '+ Generar Código de Invitación',
      todayWorkout: 'Tu Rutina',
      startWorkout: 'Iniciar Rutina',
      workoutsCompleted: 'rutinas completadas',
      activeClients: 'Alumnos Activos',
      clientWorkoutsWeek: 'Entrenamientos Alumnos (Semana)',
      workoutsCompletedClient: 'Entrenamientos Realizados',
      trainingTime: 'Tiempo de Entrenamiento',
      thisWeek: 'Esta semana',
      weeksInARow: 'semanas seguidas',
      noWorkoutsAssigned: 'Aún no tienes entrenamientos asignados. Tu entrenador asignará planes pronto.',
      assignedWorkouts: 'Tus Entrenamientos Asignados',
      nutritionAndPhotos: 'Nutrición & Fotos',
      history: 'Historial',
      metricsWeight: 'Peso / Métricas',
      myDashboard: 'Tu Panel',
      yourCoach: 'Tu Entrenador Personal',
      startWeekCopy: 'Comienza la semana con una sesión de entrenamiento.',
      remainingWorkouts: 'Faltan {count} entrenamiento(s) esta semana.',
      goalMetCopy: '¡Meta semanal cumplida! Excelente trabajo.',
      goalMet: 'Meta cumplida',
      noWorkoutsYet: 'Sin entrenamientos',
      workoutsThisWeek: 'entrenamientos esta semana',
      lastWorkoutDays: 'Último entrenamiento hace {days} días',
      notStartedYet: 'Aún no ha iniciado el plan prescrito',
      proSubscriptionActive: 'Suscripción Fit Coach Pro Activa',
      proSubscriptionTitle: 'Plan Entrenador Personal',
      proAccessDesc: 'Acceso profesional ilimitado. Toca para gestionar facturación.',
      trialDaysLeftDesc: 'Período de prueba: {days} días restantes. Toca para suscribirte.',
      trialActiveDesc: 'Prueba gratuita activa. Toca para suscribirte.',
      assignedByCoach: 'Asignado por el Entrenador {name}',
      individualPlan: 'Plan de entrenamiento individual',
    },
    workouts: {
      title: 'Entrenamientos',
      prescribedWorkouts: 'Planes Prescritos',
      assignWorkout: 'Asignar Rutina',
      assignFromTemplate: 'Desde Plantilla',
      createManually: 'Crear Manualmente',
      generateWithAI: 'Generar con IA',
      exercisesCount: 'ejercicios',
      sets: 'series',
      reps: 'reps',
      weight: 'peso',
      rest: 'descanso',
      notes: 'notas',
      startWorkout: 'Empezar Rutina',
      finishWorkout: 'Finalizar Sesión',
      finishSession: 'Finalizar Sesión',
      cloneWorkout: 'Duplicar Rutina',
      deleteWorkout: 'Eliminar Rutina',
      restTimer: 'Descanso Automático',
      studentFeedback: 'Feedback del Alumno',
      createWorkoutTitle: 'Crear Rutina',
      createTemplateTitle: 'Crear Plantilla de Rutina',
      workoutNameLabel: 'Nombre de la Rutina',
      workoutNamePlaceholder: 'Ej: Rutina A - Pecho y Tríceps',
      descriptionLabel: 'Descripción o Instrucciones',
      descriptionPlaceholder: 'Ej: Calentar 5 min, descanso estricto de 90s',
      categoryLabel: 'Categoría del Plan',
      saveAndAddExercises: 'Guardar y Añadir Ejercicios',
      createTemplateAndAddExercises: 'Crear Plantilla y Añadir Ejercicios',
      addExerciseTitle: 'Añadir Ejercicio',
      editExerciseTitle: 'Editar Ejercicio',
      exerciseName: 'Nombre del Ejercicio',
      exerciseNamePlaceholder: 'Ej: Press de Banca con Barra',
      setsLabel: 'Series',
      repsLabel: 'Repeticiones',
      weightLabel: 'Carga / Peso (kg)',
      restSecondsLabel: 'Descanso (segundos)',
      notesLabel: 'Notas e Instrucciones Técnicas',
      notesPlaceholder: 'Ej: Foco en la fase excéntrica, 3s de bajada',
      saveExercise: 'Guardar Ejercicio',
      aiWorkoutTitle: 'Rutina con IA',
      aiCoachSubtitle: 'Crea un plan de entrenamiento personalizado para prescribir a tu alumno.',
      aiClientSubtitle: 'Describe la sesión deseada. Ejemplo: Entrenamiento de 45 minutos enfocado en piernas.',
      aiPromptLabel: '¿Qué buscas en la rutina?',
      aiPromptPlaceholder: 'Ej: Pecho y tríceps, 4 ejercicios, enfoque en hipertrofia y fuerza...',
      generateWorkoutBtn: 'Generar Rutina',
      generatingWorkout: 'Creando rutina con IA...',
      record: 'Récord',
      set: 'Serie',
      restBetweenSets: 'Descanso entre Series',
      restCompleted: 'Descanso completado. Iniciar próxima serie.',
      prescribedExercises: 'Ejercicios Prescritos',
      addExercise: 'Añadir Ejercicio',
      noExercises: 'Este plan aún no tiene ejercicios añadidos.',
      sessionNotes: 'Observaciones de la Sesión (Opcional)',
      sessionNotesPlaceholder: 'Registro de fatiga, molestias musculares o ajustes...',
      deleteWorkoutConfirm: '¿Deseas eliminar este entrenamiento y todos sus ejercicios?',
      deleteExerciseConfirm: '¿Eliminar "{name}" de este entrenamiento?',
      removeExerciseTitle: 'Eliminar Ejercicio',
      workoutFinishedTitle: 'Sesión Completada',
      workoutFinishedMsg: 'Entrenamiento de {duration} minutos registrado con éxito.',
      nameRequiredAlert: 'Por favor introduce el nombre del plan.',
      assignWorkoutSubtitle: 'Crea un plan individual para este alumno. Podrás prescribir los ejercicios a continuación.',
      createWorkoutSubtitle: 'Dale un nombre a tu rutina. Podrás añadir ejercicios en el siguiente paso.',
      createTemplateSubtitle: 'Crea una plantilla reutilizable para tu biblioteca. Podrás añadir ejercicios a continuación.',
      catHypertrophy: 'Hipertrofia',
      catStrength: 'Fuerza',
      catFatLoss: 'Pérdida de Grasa',
      catFullBody: 'Cuerpo Completo',
      catConditioning: 'Acondicionamiento',
      aiDescribeWorkoutTitle: 'Describe tu entrenamiento',
      aiDescribeWorkoutMsg: 'Dile a la IA qué buscas (ej: Sesión de hipertrofia de pecho con 4 ejercicios).',
      aiGeneratedDefault: 'Generado con Inteligencia Artificial',
      aiWorkoutCreatedTitle: '¡Entrenamiento Creado!',
      aiWorkoutAssignedSuccess: 'El entrenamiento se asignó con éxito a tu alumno.',
      aiWorkoutReadySuccess: 'Tu plan de entrenamiento está listo en tu panel.',
      aiFailedTitle: 'Error de la IA',
      aiFailedMsg: 'Intenta con una solicitud más específica o directa.',
      requiredFieldsTitle: 'Campos Obligatorios',
      requiredFieldsAlert: 'El nombre, las series y las repeticiones son obligatorios.',
      suggestedWeight: 'Carga Sugerida (kg)',
      targetSets: 'Series Objetivo',
      executionNotes: 'Instrucciones de Postura y Ejecución (Opcional)',
      executionNotesPlaceholder: 'Ej: Cadencia controlada 3s excéntrica, rango completo.',
      addToPlan: 'Añadir al Plan',
      previous: 'Anterior',
      noPrevious: 'Sin registro',
      setTypeNormal: 'Normal',
      setTypeWarmup: 'Calentamiento',
      setTypeDropset: 'Drop-set',
      setTypeFailure: 'Fallo',
      timerVibrated: '¡Descanso terminado! Momento de la siguiente serie.',
      selectFromLibrary: 'Elegir de la Biblioteca',
      searchExercise: 'Buscar ejercicio...',
      catAll: 'Todos',
      catChest: 'Pecho',
      catBack: 'Espalda',
      catLegs: 'Piernas',
      catShoulders: 'Hombros',
      catArms: 'Brazos',
      catCore: 'Abdominales',
      equipment: 'Equipamiento',
      instructions: 'Instrucciones de Ejecución',
      fillFromExercise: 'Usar este ejercicio',
      lastSession: 'Última sesión',
      repShort: 'reps',
    },
    nutrition: {
      title: 'Nutrición',
      subtitle: 'Seguimiento diario de calorías, macronutrientes y análisis con IA.',
      dailyGoals: 'Metas Nutricionales y Frecuencia',
      dailyGoal: 'Meta Diaria',
      calories: 'Calorías (kcal)',
      protein: 'Proteína (g)',
      carbs: 'Carbohidratos (g)',
      fat: 'Grasas (g)',
      adjustGoals: 'Ajustar Metas',
      registeredMeals: 'Comidas Registradas Hoy',
      todayMeals: 'Comidas Registradas Hoy',
      logMeal: 'Registrar Comida',
      mealName: 'Nombre de la comida',
      noMeals: 'Ninguna comida registrada.',
      noMealsToday: 'Ninguna comida registrada hoy. Toma una foto de tu plato para comenzar.',
      scanMeal: 'Fotografiar Plato',
      galleryMeal: 'Elegir de la Galería',
      analyzingFood: 'Analizando fotografía con Inteligencia Artificial...',
      nutritionEstimate: 'Estimación Nutricional',
      discard: 'Descartar',
      saveMeal: 'Guardar Comida',
      todayTotal: 'Total de Hoy',
      cannotAnalyze: 'No se pudo analizar',
      cannotAnalyzeTips: 'Fotografía el plato con buena iluminación y encuadre.',
    },
    assessment: {
      title: 'Evaluación Corporal',
      newAssessment: 'Nueva Evaluación',
      weight: 'Peso (kg)',
      bodyFat: 'Grasa (% BF)',
      chest: 'Pectoral (cm)',
      waist: 'Cintura (cm)',
      arms: 'Brazo (cm)',
      thighs: 'Muslo (cm)',
      evolutionPhoto: 'Foto de Evolución',
      takeOrUploadPhoto: 'Cargar Foto de Evaluación',
      removePhoto: 'Eliminar Foto',
      technicalNotes: 'Notas y Observaciones Clínicas',
      noAssessments: 'Ninguna evaluación corporal registrada.',
      saveAssessment: 'Registrar Evaluación',
    },
    subscription: {
      proBadge: 'FIT COACH PRO',
      proTitle: 'Plan Profesional',
      trialExpiredTitle: 'Período de Prueba Terminado',
      trialExpiredDesc: 'Tu prueba de 14 días ha terminado. Activa tu suscripción para desbloquear el acceso total a todos tus alumnos.',
      activeDesc: 'Eleva tu gestión de atletas con todas las herramientas de entrenamiento y retención.',
      trialingDesc: 'Disfruta de tus 14 días de prueba sin compromiso antes de activar la cuota mensual.',
      pricePerMonth: '19,99 € / mes',
      cancelAnytime: 'Sin permanencia  ·  Cancela cuando quieras',
      activateStripe: 'Activar Suscripción con Stripe',
      activateDemo: 'Activar Modo Demo (Simular Pago)',
      manageBilling: 'Gestionar Facturación / Tarjeta',
      logout: 'Cerrar Sesión',
      daysLeftTrial: 'días de prueba restantes',
      statusActive: 'Activa',
      statusExpired: 'Expirada',
      statusTrial: 'Período de Prueba',
      featureUnlimitedStudents: 'Gestión ilimitada de alumnos y fichas clínicas',
      featureTemplates: 'Biblioteca y prescripción directa de plantillas de rutina',
      featureNutrition: 'Prescripción de calorías y macronutrientes personalizados',
      featureAssessments: 'Evaluaciones físicas completas y fotos de evolución',
      featureAI: 'Creación acelerada de rutinas con Inteligencia Artificial',
      featureRetention: 'Panel anti-churn con alertas de abandono de alumnos',
      noStripeKeyPrompt: 'La clave de API de Stripe no está configurada en el servidor. ¿Deseas activar la suscripción mediante el simulador de pruebas?',
    },
    profile: {
      title: 'Tu Perfil',
      name: 'Nombre',
      placeholderName: 'Tu nombre',
      settingsAndAppearance: 'Ajustes y Apariencia',
      themeSub: 'Personaliza el tema y el idioma de tu aplicación.',
      themeTitle: 'Tema Visual',
      themeDark: 'Oscuro',
      themeLight: 'Claro',
      languageTitle: 'Idioma de la Aplicación',
      yourCoach: 'Tu Entrenador Personal',
      coachCodeDesc: '¿Tienes un entrenador? Introduce el código de 4 dígitos proporcionado por tu PT:',
      linkBtn: 'Vincular',
      weeklyGoalTitle: 'Meta Semanal',
      weeklyGoalSub: '¿Cuántas sesiones planeas entrenar por semana?',
      weeklySessions: 'sesiones',
      saveGoalBtn: 'Guardar Meta',
      weightLogTitle: 'Registro de Peso Corporal',
      weightLogSub: 'Sigue tu evolución a lo largo del tiempo.',
      logWeightBtn: 'Registrar',
      subCoachTitle: 'Suscripción Fit Coach Pro',
      subCoachSub: 'Gestión de cuenta de Entrenador Personal',
      subActiveDesc: 'Tienes acceso profesional total sin límite de alumnos ni rutinas.',
      subExpiredDesc: 'Tu período de prueba ha terminado. Las funciones de entrenador están suspendidas.',
      subTrialDesc: 'Disfruta de tu prueba de 14 días sin compromiso antes de iniciar la mensualidad.',
      manageBillingStripe: 'Gestionar Facturación en Stripe',
      subscribePlanPrice: 'Suscribir Plan (19,99 €/mes)',
      devToolsTitle: 'Herramientas de Simulación (Pruebas):',
      simulateActivation: 'Simular Activación',
      simulateExpiry: 'Simular Expiración',
      switchRoleBtn: 'Cambiar Rol',
      switchToClient: 'Cambiar Modo a Alumno (Cliente)',
      switchToCoach: 'Cambiar Modo a Entrenador Personal',
      logoutBtn: 'Cerrar Sesión',
      errorLoadingImage: 'No se pudo cargar la foto de perfil.',
      nameRequired: 'Nombre obligatorio',
      nameRequiredMsg: 'Por favor introduce un nombre válido.',
      goalSavedSuccess: 'Objetivo semanal actualizado con éxito.',
      invalidWeightMsg: 'Por favor introduce un valor numérico válido.',
      enterInviteCodePrompt: 'Introduce el código de invitación proporcionado por tu entrenador.',
      linkedCoachSuccess: '¡Vinculado a tu entrenador con éxito!',
      switchRoleTitle: 'Cambiar Rol',
      switchRoleConfirm: '¿Deseas cambiar tu cuenta a {role}?',
      switchRoleSuccess: '¡Ahora estás en modo {role}!',
      devSubscriptionActivated: 'Suscripción profesional activada con éxito en modo de demostración.',
      devModeTitle: 'Modo de Prueba',
      devTrialExpired: 'Período de prueba expirado. Todas las funciones de entrenador están ahora bloqueadas.',
      stripePortal: 'Portal Stripe',
      saveChanges: 'Guardar Cambios',
    },
    clientDetails: {
      studentFile: 'Ficha del Alumno',
      currentWeight: 'Peso Actual',
      currentStreak: 'Racha Actual',
      weeklyGoal: 'Meta Semanal',
      tabWorkouts: 'Rutinas',
      tabHistory: 'Historial',
      tabNutrition: 'Nutrición',
      tabAssessment: 'Evaluación',
      prescribedPlans: 'Planes Prescritos',
      assignWorkout: 'Asignar Rutina',
      exercisesCount: 'ejercicios',
      noWorkoutsAssigned: 'Aún no has prescrito ninguna rutina a este alumno.',
      prescribeFirst: 'Prescribir Primera Rutina',
      selectAssignMethod: 'Seleccione el método de prescripción deseado:',
      fromTemplate: 'Desde Plantilla',
      withAI: 'Generador con IA',
      createManually: 'Crear Manualmente',
      adjustGoals: 'Metas del Alumno',
      dailyCalories: 'Calorías Diarias (kcal)',
      dailyProtein: 'Proteína (g)',
      dailyCarbs: 'Carbohidratos (g)',
      dailyFat: 'Grasas (g)',
      weeklySessions: 'Meta Semanal de Rutinas',
      saveGoals: 'Guardar Metas',
      newAssessment: 'Nueva Evaluación Corporal',
      evolutionPhoto: 'Foto de Evolución',
      takeOrPickPhoto: 'Cargar Foto',
      removePhoto: 'Eliminar Foto',
      technicalNotes: 'Notas y Observaciones Clínicas',
      recordAssessment: 'Registrar Evaluación',
      removeStudent: 'Eliminar Alumno',
      confirmRemoveStudent: '¿Estás seguro de que deseas desvincular a este alumno?',
      latestWeight: 'Peso Actual',
      nutritionAndGoalsTitle: 'Metas Nutricionales y Frecuencia',
      nutritionAndGoalsSub: 'Prescripción personalizada para este alumno',
      adjust: 'Ajustar',
      selectTemplateSub: 'Seleccione un plan para prescribir al alumno',
      assignTemplateTitle: 'Asignar Plantilla',
      assignTemplateConfirm: '¿Deseas asignar el plan "{template}" al alumno {name}?',
      assignTemplateSuccess: 'Plan "{template}" asignado con éxito.',
      studentRemovedSuccess: 'Alumno eliminado con éxito.',
      modalGoalsTitle: 'Metas del Alumno',
      modalGoalsSub: 'Configurar objetivos nutricionales y frecuencia',
      modalAssessmentSub: 'Registrar peso, perímetros y fotografía',
      bodyPerimeters: 'Perímetros Corporales (cm)',
      weightRequiredAlert: 'El peso corporal es obligatorio para registrar la evaluación.',
      assessmentSavedSuccess: 'Evaluación corporal registrada con éxito.',
      goalsSavedSuccess: 'Metas nutricionales y de frecuencia actualizadas con éxito.',
      noFinishedWorkouts: 'El alumno aún no ha registrado ningún entrenamiento finalizado.',
      noMealsRecorded: 'Ninguna comida registrada por este alumno.',
      weeksCount: 'sem',
      perWeek: 'días',
    },
    templates: {
      title: 'Plantillas de Rutina',
      subtitle: 'Crea planes estándar para prescribir rápidamente a tus alumnos.',
      createTemplate: 'Crear Nueva Plantilla',
      emptyTitle: 'Aún no tienes plantillas creadas',
      emptyDesc: 'Crea plantillas de rutina (ej: Hipertrofia A/B, Full Body) para asignar en 1 clic.',
      deleteTemplateConfirm: '¿Estás seguro de que deseas eliminar esta plantilla?',
    },
    history: {
      title: 'Historial de Entrenamientos',
      subtitle: 'Registro de todas tus sesiones completadas y evolución.',
      noLogs: 'Aún no has completado ningún entrenamiento. Inicia una sesión en tu panel.',
      exportCSV: 'Exportar a CSV',
      shareWorkout: 'Compartir Rutina',
      noDataToExport: 'Aún no hay entrenamientos registrados para exportar.',
      workoutCompletedShare: 'Completé el entrenamiento "{workoutName}" ({duration} min) en Fit Coach Hub.',
      workoutCompletedDefault: 'Entrenamiento Completado',
      noData: 'Sin datos',
      csvExportError: 'No se pudo generar el reporte CSV.',
      shareNotAvailable: 'Compartir archivos no está disponible en este dispositivo.',
    },
    invite: {
      title: 'Invitar Alumno',
      desc: 'Genera un código de activación de 4 dígitos para compartir con tu nuevo alumno.',
      codeLabel: 'CÓDIGO DE ACTIVACIÓN',
      validFor: 'Válido durante 48 horas',
      shareBtn: 'Compartir Código',
      generateBtn: 'Generar Código de Invitación',
      shareMessage: 'Acceso a planes de entrenamiento en la app Fit Coach Hub.\n\nCódigo de activación: {code}\nIntroduce este código en la aplicación para iniciar.',
    },
    analytics: {
      chartsTitle: 'Gráficos de Evolución',
      chartsSubtitle: 'Monitorea el progreso de tu peso y fuerza a lo largo del tiempo.',
      coachChartsSubtitle: 'Visualiza la progresión del peso y el 1RM estimado de tu alumno.',
      weightEvolution: 'Evolución del Peso Corporal',
      weightEmptyPrompt: 'Registra tu peso o haz un check-in semanal para generar el gráfico.',
      strengthEvolution: 'Carga Máxima y 1RM',
      strengthEmptyPrompt: 'Sin sesiones completadas con peso para este ejercicio.',
      estimated1RM: '1RM Estimado',
      noSessionsCompleted: 'Sin sesiones completadas para este ejercicio.',
      noChartData: 'Sin datos suficientes para mostrar el gráfico.',
    },
    checkin: {
      title: 'Check-in Semanal',
      bannerSubtitle: 'Registra tu peso en ayunas, fotos y notas para tu entrenador',
      tabTitle: 'Check-ins',
      emptyTitle: 'Sin check-ins enviados',
      emptyText: 'Tu alumno aún no ha enviado ningún check-in semanal. ¡Envíale una notificación para animarlo!',
      sendPushBtn: 'Enviar Notificación 🔔',
      prescribedByCoach: 'Prescrito por tu Entrenador',
      painAlert: 'Alerta de Dolor / Lesión Notificada',
      feedbackTitle: 'Feedback Semanal del Entrenador',
      feedbackPlaceholder: 'Escribe aquí el feedback de la semana para tu alumno...',
      sendFeedbackBtn: 'Enviar Feedback al Aluno 🚀',
      feedbackSentSuccess: '¡Feedback enviado con éxito!',
    },
    exerciseGuide: {
      title: 'Guía de Ejecución y Postura',
      targetMuscles: 'Músculos Objetivo',
      setupTitle: 'Posición Inicial',
      executionTitle: 'Ejecución y Respiración',
      mistakesTitle: 'Errores Comunes a Evitar',
      videoDemoTitle: 'Demostración en Vídeo',
      watchOnYoutube: 'Ver Ejecución en YouTube 🎥',
      editVideoUrl: 'Personalizar Vídeo/GIF del Ejercicio',
      saveVideoUrl: 'Guardar Enlace de Vídeo',
      videoUrlPlaceholder: 'URL del vídeo (ej: YouTube, Vimeo, MP4, GIF)...',
      videoUrlSaved: '¡Enlace de vídeo guardado con éxito!',
    },
    substituteExercise: {
      modalTitle: 'Sustituir Ejercicio',
      modalSubtitle: '¿La máquina está ocupada? Elige un ejercicio equivalente sin perder el estímulo:',
      searchPlaceholder: 'Buscar ejercicio alternativo...',
      recommendedEquivalents: 'Equivalentes Recomendados (Mismo Grupo Muscular)',
      allEquivalents: 'Todos los Ejercicios Alternativos',
      confirmSwapTitle: 'Sustituir Ejercicio',
      confirmSwapMessage: '¿Deseas sustituir "{oldName}" por "{newName}" en esta rutina?',
      swapSuccess: '¡Ejercicio sustituido con éxito!',
      sameGroupTag: 'Equivalente',
      dumbbellAltTag: 'Con Mancuernas',
      cableAltTag: 'En Poleas',
      machineAltTag: 'En Máquina',
    },
  },

  fr: {
    common: {
      save: 'Enregistrer',
      saving: 'Enregistrement...',
      cancel: 'Annuler',
      delete: 'Supprimer',
      back: 'Retour',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      confirm: 'Confirmer',
      edit: 'Modifier',
      close: 'Fermer',
      remove: 'Supprimer',
      yes: 'Oui',
      no: 'Non',
      discard: 'Ignorer',
      attention: 'Attention',
      status: 'Statut',
    },
    auth: {
      appTitle: 'Fit Coach Hub',
      appSubtitle: 'Plateforme pour Coachs Sportifs pour gérer clients, entraînements et progression.',
      loginAs: 'Se connecter en tant que :',
      coach: 'Coach Sportif',
      client: 'Élève / Client',
      continueGoogle: 'Continuer avec Google',
      devSectionTitle: 'Mode de Test Rapide (Sans Google)',
      devCoachBtn: 'Entrer comme Coach (PT)',
      devClientBtn: 'Entrer comme Élève (Client)',
    },
    dashboard: {
      hello: 'Bonjour',
      roleCoach: 'Coach Sportif',
      roleClient: 'Élève',
      weeklyGoal: 'Objectif Hebdomadaire',
      currentStreak: 'Série Actuelle',
      sessions: 'séances',
      myStudents: 'Mes Élèves',
      inviteStudent: '+ Inviter un Élève',
      templates: 'Modèles',
      createWorkout: 'Créer une Séance',
      aiGenerator: 'Générateur IA',
      alertsTitle: 'Alertes de Suivi',
      alertsSubtitle: 'Élèves nécessitant un contact pour prévenir l\'abandon :',
      inactiveFor: 'Inactif depuis',
      noStudents: 'Aucun élève associé pour le moment',
      emptyInviteBtn: '+ Générer un Code d\'Invitation',
      todayWorkout: 'Votre Séance',
      startWorkout: 'Démarrer la Séance',
      workoutsCompleted: 'séances terminées',
      activeClients: 'Élèves Actifs',
      clientWorkoutsWeek: 'Séances Élèves (Semaine)',
      workoutsCompletedClient: 'Séances Effectuées',
      trainingTime: 'Temps d\'Entraînement',
      thisWeek: 'Cette semaine',
      weeksInARow: 'semaines consécutives',
      noWorkoutsAssigned: 'Aucune séance assignée pour le moment. Votre coach vous assignera des plans bientôt.',
      assignedWorkouts: 'Vos Séances Assignées',
      nutritionAndPhotos: 'Nutrition & Photos',
      history: 'Historique',
      metricsWeight: 'Poids / Métriques',
      myDashboard: 'Votre Tableau de Bord',
      yourCoach: 'Votre Coach Sportif',
      startWeekCopy: 'Commencez la semaine avec une séance d\'entraînement.',
      remainingWorkouts: '{count} séance(s) restante(s) cette semaine.',
      goalMetCopy: 'Objectif hebdomadaire atteint ! Excellent travail.',
      goalMet: 'Objectif atteint',
      noWorkoutsYet: 'Aucune séance',
      workoutsThisWeek: 'séances cette semaine',
      lastWorkoutDays: 'Dernière séance il y a {days} jours',
      notStartedYet: 'N\'a pas encore commencé le plan',
      proSubscriptionActive: 'Abonnement Fit Coach Pro Actif',
      proSubscriptionTitle: 'Plan Coach Sportif',
      proAccessDesc: 'Accès professionnel illimité. Touchez pour gérer la facturation.',
      trialDaysLeftDesc: 'Période d\'essai : {days} jours restants. Touchez pour vous abonner.',
      trialActiveDesc: 'Essai gratuit actif. Touchez pour vous abonner.',
      assignedByCoach: 'Assigné par le Coach {name}',
      individualPlan: 'Plan d\'entraînement individuel',
    },
    workouts: {
      title: 'Séances',
      prescribedWorkouts: 'Plans Prescrits',
      assignWorkout: 'Attribuer une Séance',
      assignFromTemplate: 'Depuis un Modèle',
      createManually: 'Créer Manuellement',
      generateWithAI: 'Générer avec l\'IA',
      exercisesCount: 'exercices',
      sets: 'séries',
      reps: 'réps',
      weight: 'poids',
      rest: 'repos',
      notes: 'notes',
      startWorkout: 'Démarrer',
      finishWorkout: 'Terminer la Séance',
      finishSession: 'Terminer la Séance',
      cloneWorkout: 'Dupliquer la Séance',
      deleteWorkout: 'Supprimer la Séance',
      restTimer: 'Chronomètre de Repos',
      studentFeedback: 'Commentaires de l\'Élève',
      createWorkoutTitle: 'Créer une Séance',
      createTemplateTitle: 'Créer un Modèle de Séance',
      workoutNameLabel: 'Nom de la Séance',
      workoutNamePlaceholder: 'Ex : Séance A - Pectoraux & Triceps',
      descriptionLabel: 'Description ou Instructions',
      descriptionPlaceholder: 'Ex : Échauffement 5 min, repos strict 90s',
      categoryLabel: 'Catégorie du Plan',
      saveAndAddExercises: 'Enregistrer et Ajouter des Exercices',
      createTemplateAndAddExercises: 'Créer Modèle et Ajouter Exercices',
      addExerciseTitle: 'Ajouter un Exercice',
      editExerciseTitle: 'Modifier l\'Exercice',
      exerciseName: 'Nom de l\'Exercice',
      exerciseNamePlaceholder: 'Ex : Développé Couché Barre',
      setsLabel: 'Séries',
      repsLabel: 'Répétitions',
      weightLabel: 'Charge / Poids (kg)',
      restSecondsLabel: 'Repos (secondes)',
      notesLabel: 'Notes et Conseils Techniques',
      notesPlaceholder: 'Ex : Tempo 3s descente, contraction maximale',
      saveExercise: 'Enregistrer l\'Exercice',
      aiWorkoutTitle: 'Séance avec IA',
      aiCoachSubtitle: 'Créez un plan personnalisé à prescrire à votre élève.',
      aiClientSubtitle: 'Décrivez la séance souhaitée. Exemple : Séance de 45 minutes axée jambes et fessiers.',
      aiPromptLabel: 'Que souhaitez-vous dans la séance ?',
      aiPromptPlaceholder: 'Ex : Pectoraux et triceps, 4 exercices, focus hypertrophie et force...',
      generateWorkoutBtn: 'Générer la Séance',
      generatingWorkout: 'Création de la séance avec l\'IA...',
      record: 'Record',
      set: 'Série',
      restBetweenSets: 'Repos entre Séries',
      restCompleted: 'Repos terminé. Commencer la série suivante.',
      prescribedExercises: 'Exercices Prescrits',
      addExercise: 'Ajouter un Exercice',
      noExercises: 'Ce plan ne comporte aucun exercice pour le moment.',
      sessionNotes: 'Remarques sur la Séance (Optionnel)',
      sessionNotesPlaceholder: 'Remarques sur la fatigue, douleurs ou ajustements...',
      deleteWorkoutConfirm: 'Voulez-vous supprimer cet entraînement et tous ses exercices ?',
      deleteExerciseConfirm: 'Retirer "{name}" de cet entraînement ?',
      removeExerciseTitle: 'Supprimer l\'Exercice',
      workoutFinishedTitle: 'Séance Terminée',
      workoutFinishedMsg: 'Entraînement de {duration} minutes enregistré avec succès.',
      nameRequiredAlert: 'Veuillez saisir le nom du plan.',
      assignWorkoutSubtitle: 'Créez un plan personnalisé pour cet élève. Vous pourrez ajouter les exercices ensuite.',
      createWorkoutSubtitle: 'Donnez un nom à votre entraînement. Vous pourrez ajouter les exercices ensuite.',
      createTemplateSubtitle: 'Créez un modèle réutilisable pour votre bibliothèque. Vous pourrez ajouter les exercices ensuite.',
      catHypertrophy: 'Hypertrophie',
      catStrength: 'Force',
      catFatLoss: 'Perte de Gras',
      catFullBody: 'Corps Entier',
      catConditioning: 'Condition Physique',
      aiDescribeWorkoutTitle: 'Décrivez votre séance',
      aiDescribeWorkoutMsg: 'Dites à l\'IA ce que vous recherchez (ex : Séance d\'hypertrophie des pectoraux avec 4 exercices).',
      aiGeneratedDefault: 'Généré avec l\'Intelligence Artificielle',
      aiWorkoutCreatedTitle: 'Séance Créée !',
      aiWorkoutAssignedSuccess: 'La séance a été assignée avec succès à votre élève.',
      aiWorkoutReadySuccess: 'Votre plan d\'entraînement est prêt sur votre tableau de bord.',
      aiFailedTitle: 'Échec de l\'IA',
      aiFailedMsg: 'Essayez une requête plus précise ou directe.',
      requiredFieldsTitle: 'Champs Obligatoires',
      requiredFieldsAlert: 'Le nom, les séries et les répétitions sont obligatoires.',
      suggestedWeight: 'Charge Suggérée (kg)',
      targetSets: 'Séries Cibles',
      executionNotes: 'Instructions de Posture et d\'Exécution (Optionnel)',
      executionNotesPlaceholder: 'Ex : Cadence contrôlée 3s excentrique, amplitude complète.',
      addToPlan: 'Ajouter au Plan',
      previous: 'Précédent',
      noPrevious: 'Aucun enregistrement',
      setTypeNormal: 'Normal',
      setTypeWarmup: 'Échauffement',
      setTypeDropset: 'Drop-set',
      setTypeFailure: 'Échec',
      timerVibrated: 'Repos terminé ! Préparez la prochaine série.',
      selectFromLibrary: 'Choisir dans la Bibliothèque',
      searchExercise: 'Rechercher un exercice...',
      catAll: 'Tous',
      catChest: 'Pectoraux',
      catBack: 'Dos',
      catLegs: 'Jambes',
      catShoulders: 'Épaules',
      catArms: 'Bras',
      catCore: 'Abdominaux',
      equipment: 'Équipement',
      instructions: 'Instructions d\'Exécution',
      fillFromExercise: 'Utiliser cet exercice',
      lastSession: 'Dernière séance',
      repShort: 'reps',
    },
    nutrition: {
      title: 'Nutrition',
      subtitle: 'Suivi quotidien des calories, macronutriments et analyse IA.',
      dailyGoals: 'Objectifs Nutritionnels et Fréquence',
      dailyGoal: 'Objectif Quotidien',
      calories: 'Calories (kcal)',
      protein: 'Protéines (g)',
      carbs: 'Glucides (g)',
      fat: 'Lipides (g)',
      adjustGoals: 'Ajuster Objectifs',
      registeredMeals: 'Repas Enregistrés Aujourd\'hui',
      todayMeals: 'Repas Enregistrés Aujourd\'hui',
      logMeal: 'Ajouter un Repas',
      mealName: 'Nom du repas',
      noMeals: 'Aucun repas enregistré.',
      noMealsToday: 'Aucun repas enregistré aujourd\'hui. Prenez une photo de votre plat pour commencer.',
      scanMeal: 'Scanner le Plat',
      galleryMeal: 'Choisir depuis la Galerie',
      analyzingFood: 'Analyse de la photo du repas par Intelligence Artificielle...',
      nutritionEstimate: 'Estimation Nutritionnelle',
      discard: 'Ignorer',
      saveMeal: 'Enregistrer le Repas',
      todayTotal: 'Total d\'Aujourd\'hui',
      cannotAnalyze: 'Impossible d\'analyser',
      cannotAnalyzeTips: 'Photographiez le plat avec un bon éclairage et cadrage.',
    },
    assessment: {
      title: 'Évaluation Corporelle',
      newAssessment: 'Nouvelle Évaluation',
      weight: 'Poids (kg)',
      bodyFat: 'Masse Grasse (% BF)',
      chest: 'Poitrine (cm)',
      waist: 'Taille (cm)',
      arms: 'Bras (cm)',
      thighs: 'Cuisse (cm)',
      evolutionPhoto: 'Photo d\'Évolution',
      takeOrUploadPhoto: 'Télécharger une Photo',
      removePhoto: 'Supprimer la Photo',
      technicalNotes: 'Notes Techniques et Cliniques',
      noAssessments: 'Aucune évaluation corporelle enregistrée.',
      saveAssessment: 'Enregistrer l\'Évaluation',
    },
    subscription: {
      proBadge: 'FIT COACH PRO',
      proTitle: 'Plan Professionnel',
      trialExpiredTitle: 'Période d\'Essai Terminée',
      trialExpiredDesc: 'Votre essai de 14 jours est terminé. Activez votre abonnement pour débloquer l\'accès complet à tous vos élèves.',
      activeDesc: 'Optimisez votre suivi d\'athlètes avec tous les outils d\'entraînement et de fidélisation.',
      trialingDesc: 'Profitez de vos 14 jours d\'essai sans engagement avant d\'activer votre abonnement.',
      pricePerMonth: '19,99 € / mois',
      cancelAnytime: 'Sans engagement  ·  Résiliable à tout moment',
      activateStripe: 'Activer l\'Abonnement avec Stripe',
      activateDemo: 'Mode Démonstration (Simuler le Paiement)',
      manageBilling: 'Gérer la Facturation / Carte',
      logout: 'Se Déconnecter',
      daysLeftTrial: 'jours d\'essai restants',
      statusActive: 'Actif',
      statusExpired: 'Expiré',
      statusTrial: 'Période d\'Essai',
      featureUnlimitedStudents: 'Gestion illimitée d\'élèves et dossiers de suivi',
      featureTemplates: 'Bibliothèque et prescription instantanée de modèles',
      featureNutrition: 'Prescription personnalisée de calories et macronutriments',
      featureAssessments: 'Évaluations physiques complètes et photos d\'évolution',
      featureAI: 'Création rapide de séances avec Intelligence Artificielle',
      featureRetention: 'Tableau de bord anti-churn avec alertes de suivi',
      noStripeKeyPrompt: 'La clé d\'API Stripe n\'est pas configurée sur le serveur. Souhaitez-vous activer l\'abonnement via le simulateur de développement ?',
    },
    profile: {
      title: 'Votre Profil',
      name: 'Nom',
      placeholderName: 'Votre nom',
      settingsAndAppearance: 'Paramètres et Apparence',
      themeSub: 'Personnalisez le thème et la langue de votre application.',
      themeTitle: 'Thème Visuel',
      themeDark: 'Sombre',
      themeLight: 'Clair',
      languageTitle: 'Langue de l\'Application',
      yourCoach: 'Votre Coach Sportif',
      coachCodeDesc: 'Vous avez un coach ? Entrez le code à 4 chiffres fourni par votre coach :',
      linkBtn: 'Associer',
      weeklyGoalTitle: 'Objectif Hebdomadaire',
      weeklyGoalSub: 'Combien de séances prévoyez-vous par semaine ?',
      weeklySessions: 'séances',
      saveGoalBtn: 'Enregistrer l\'Objectif',
      weightLogTitle: 'Suivi du Poids Corporel',
      weightLogSub: 'Suivez votre progression dans le temps.',
      logWeightBtn: 'Enregistrer',
      subCoachTitle: 'Abonnement Fit Coach Pro',
      subCoachSub: 'Gestion du compte Coach Sportif',
      subActiveDesc: 'Vous bénéficiez d\'un accès professionnel complet sans limite d\'élèves.',
      subExpiredDesc: 'Votre période d\'essai est terminée. Les fonctionnalités de coach sont suspendues.',
      subTrialDesc: 'Profitez de vos 14 jours d\'essai sans engagement avant d\'activer votre abonnement.',
      manageBillingStripe: 'Gérer la Facturation sur Stripe',
      subscribePlanPrice: 'S\'abonner au Plan (19,99 €/mois)',
      devToolsTitle: 'Outils de Simulation (Développeur) :',
      simulateActivation: 'Simuler l\'Activation',
      simulateExpiry: 'Simuler l\'Expiration',
      switchRoleBtn: 'Changer de Rôle',
      switchToClient: 'Passer en Mode Élève (Client)',
      switchToCoach: 'Passer en Mode Coach Sportif',
      logoutBtn: 'Se Déconnecter',
      errorLoadingImage: 'Impossible de télécharger la photo de profil.',
      nameRequired: 'Nom obligatoire',
      nameRequiredMsg: 'Veuillez saisir un nom valide.',
      goalSavedSuccess: 'Objectif hebdomadaire mis à jour avec succès.',
      invalidWeightMsg: 'Veuillez saisir une valeur numérique valide.',
      enterInviteCodePrompt: 'Saisissez le code d\'invitation fourni par votre coach.',
      linkedCoachSuccess: 'Associé à votre coach avec succès !',
      switchRoleTitle: 'Changer de Rôle',
      switchRoleConfirm: 'Voulez-vous basculer votre compte en {role} ?',
      switchRoleSuccess: 'Vous êtes maintenant en mode {role} !',
      devSubscriptionActivated: 'Abonnement professionnel activé avec succès en mode démo.',
      devModeTitle: 'Mode Test',
      devTrialExpired: 'Période d\'essai expirée. Toutes les fonctionnalités de coach sont maintenant verrouillées.',
      stripePortal: 'Portail Stripe',
      saveChanges: 'Enregistrer les Modifications',
    },
    clientDetails: {
      studentFile: 'Fiche de l\'Élève',
      currentWeight: 'Poids Actuel',
      currentStreak: 'Série Actuelle',
      weeklyGoal: 'Objectif Hebdo',
      tabWorkouts: 'Séances',
      tabHistory: 'Historique',
      tabNutrition: 'Nutrition',
      tabAssessment: 'Évaluation',
      prescribedPlans: 'Plans Prescrits',
      assignWorkout: 'Attribuer une Séance',
      exercisesCount: 'exercices',
      noWorkoutsAssigned: 'Vous n\'avez encore assigné aucune séance à cet élève.',
      prescribeFirst: 'Prescrire la Première Séance',
      selectAssignMethod: 'Sélectionnez la méthode d\'assignation souhaitée :',
      fromTemplate: 'Depuis un Modèle',
      withAI: 'Générateur avec IA',
      createManually: 'Créer Manuellement',
      adjustGoals: 'Objectifs de l\'Élève',
      dailyCalories: 'Calories Quotidiennes (kcal)',
      dailyProtein: 'Protéines (g)',
      dailyCarbs: 'Glucides (g)',
      dailyFat: 'Lipides (g)',
      weeklySessions: 'Séances Hebdomadaires',
      saveGoals: 'Enregistrer les Objectifs',
      newAssessment: 'Nouvelle Évaluation Corporelle',
      evolutionPhoto: 'Photo d\'Évolution',
      takeOrPickPhoto: 'Télécharger une Photo',
      removePhoto: 'Supprimer la Photo',
      technicalNotes: 'Notes Techniques et Cliniques',
      recordAssessment: 'Enregistrer l\'Évaluation',
      removeStudent: 'Retirer l\'Élève',
      confirmRemoveStudent: 'Êtes-vous sûr de vouloir retirer cet élève ?',
      latestWeight: 'Poids Actuel',
      nutritionAndGoalsTitle: 'Objectifs Nutritionnels et Fréquence',
      nutritionAndGoalsSub: 'Prescription personnalisée pour cet élève',
      adjust: 'Ajuster',
      selectTemplateSub: 'Sélectionnez un plan à prescrire à l\'élève',
      assignTemplateTitle: 'Attribuer le Modèle',
      assignTemplateConfirm: 'Voulez-vous assigner le plan "{template}" à l\'élève {name} ?',
      assignTemplateSuccess: 'Plan "{template}" attribué avec succès.',
      studentRemovedSuccess: 'Élève retiré avec succès.',
      modalGoalsTitle: 'Objectifs de l\'Élève',
      modalGoalsSub: 'Configurer les objectifs nutritionnels et la fréquence',
      modalAssessmentSub: 'Enregistrer le poids, mensurations et photo',
      bodyPerimeters: 'Mensurations Corporelles (cm)',
      weightRequiredAlert: 'Le poids corporel est obligatoire pour enregistrer l\'évaluation.',
      assessmentSavedSuccess: 'Évaluation corporelle enregistrée avec succès.',
      goalsSavedSuccess: 'Objectifs nutritionnels et de fréquence mis à jour avec succès.',
      noFinishedWorkouts: 'L\'élève n\'a pas encore enregistré de séance terminée.',
      noMealsRecorded: 'Aucun repas enregistré par cet élève.',
      weeksCount: 'sem',
      perWeek: 'jours',
    },
    templates: {
      title: 'Modèles de Séance',
      subtitle: 'Créez des plans types à assigner rapidement à vos élèves.',
      createTemplate: 'Créer un Nouveau Modèle',
      emptyTitle: 'Aucun modèle créé pour l\'instant',
      emptyDesc: 'Créez des modèles (ex : Hypertrophie A/B, Full Body Débutant) pour les assigner en 1 clic.',
      deleteTemplateConfirm: 'Êtes-vous sûr de vouloir supprimer ce modèle ?',
    },
    history: {
      title: 'Historique des Séances',
      subtitle: 'Historique de toutes vos séances terminées et évolution.',
      noLogs: 'Vous n\'avez encore terminé aucune séance. Démarrez une séance depuis votre tableau de bord.',
      exportCSV: 'Exporter en CSV',
      shareWorkout: 'Partager la Séance',
      noDataToExport: 'Aucun entraînement enregistré à exporter pour le moment.',
      workoutCompletedShare: 'J\'ai terminé la séance "{workoutName}" ({duration} min) sur Fit Coach Hub.',
      workoutCompletedDefault: 'Entraînement Terminé',
      noData: 'Aucune donnée',
      csvExportError: 'Impossible de générer le rapport CSV.',
      shareNotAvailable: 'Le partage de fichiers n\'est pas disponible sur cet appareil.',
    },
    invite: {
      title: 'Inviter un Élève',
      desc: 'Générez un code d\'activation à 4 chiffres à partager avec votre nouvel élève.',
      codeLabel: 'CODE D\'ACTIVATION',
      validFor: 'Valable pendant 48 heures',
      shareBtn: 'Partager le Code',
      generateBtn: 'Générer un Code d\'Invitation',
      shareMessage: 'Accès aux plans d\'entraînement sur l\'application Fit Coach Hub.\n\nCode d\'activation : {code}\nEntrez ce code dans l\'application pour commencer.',
    },
    analytics: {
      chartsTitle: 'Graphiques d\'Évolution',
      chartsSubtitle: 'Suivez l\'évolution de votre poids et de votre force au fil du temps.',
      coachChartsSubtitle: 'Visualisez la progression du poids et le 1RM estimé de votre élève.',
      weightEvolution: 'Évolution du Poids Corporel',
      weightEmptyPrompt: 'Enregistrez votre poids ou effectuez un check-in hebdomadaire pour afficher le graphique.',
      strengthEvolution: 'Charge Maximale & 1RM',
      strengthEmptyPrompt: 'Aucune séance avec charge complétée pour cet exercice.',
      estimated1RM: '1RM Estimé',
      noSessionsCompleted: 'Aucune séance complétée pour cet exercice.',
      noChartData: 'Pas assez de données pour afficher le graphique.',
    },
    checkin: {
      title: 'Check-in Hebdomadaire',
      bannerSubtitle: 'Enregistrez votre poids à jeun, vos photos et vos notes pour votre coach',
      tabTitle: 'Check-ins',
      emptyTitle: 'Aucun check-in soumis',
      emptyText: 'Votre élève n\'a pas encore soumis de check-in hebdomadaire. Envoyez-lui une notification pour l\'encourager !',
      sendPushBtn: 'Envoyer une Notification 🔔',
      prescribedByCoach: 'Prescrit par votre Coach',
      painAlert: 'Alerte Douleur / Blessure Signalée',
      feedbackTitle: 'Feedback Hebdomadaire du Coach',
      feedbackPlaceholder: 'Écrivez ici le feedback de la semaine pour votre élève...',
      sendFeedbackBtn: 'Envoyer le Feedback à l\'Élève 🚀',
      feedbackSentSuccess: 'Feedback envoyé avec succès !',
    },
    exerciseGuide: {
      title: 'Guide d\'Exécution & Posture',
      targetMuscles: 'Muscles Ciblés',
      setupTitle: 'Positionnement Initial',
      executionTitle: 'Exécution & Respiration',
      mistakesTitle: 'Erreurs Courantes à Éviter',
      videoDemoTitle: 'Démonstration Vidéo',
      watchOnYoutube: 'Voir l\'Exécution sur YouTube 🎥',
      editVideoUrl: 'Personnaliser la Vidéo/GIF de l\'Exercice',
      saveVideoUrl: 'Enregistrer le Lien Vidéo',
      videoUrlPlaceholder: 'URL de la vidéo (ex: YouTube, Vimeo, MP4, GIF)...',
      videoUrlSaved: 'Lien vidéo enregistré avec succès !',
    },
    substituteExercise: {
      modalTitle: 'Remplacer l\'Exercice',
      modalSubtitle: 'La machine est occupée ? Choisissez un équivalent sans perdre le stimulus :',
      searchPlaceholder: 'Rechercher un exercice alternatif...',
      recommendedEquivalents: 'Équivalents Recommandés (Même Groupe Musculaire)',
      allEquivalents: 'Tous les Exercices Alternatifs',
      confirmSwapTitle: 'Remplacer l\'Exercice',
      confirmSwapMessage: 'Voulez-vous remplacer "{oldName}" par "{newName}" dans cette séance ?',
      swapSuccess: 'Exercice remplacé avec succès !',
      sameGroupTag: 'Équivalent',
      dumbbellAltTag: 'Aux Haltères',
      cableAltTag: 'À la Poulie',
      machineAltTag: 'À la Machine',
    },
  },
};
