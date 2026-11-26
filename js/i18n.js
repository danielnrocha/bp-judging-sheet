/* ---------- idioma: PT-BR (padrão), EN, ES ---------- */
(() => {
  const LANGS = ['pt', 'en', 'es'];
  let L = 'pt';
  try {
    const x = localStorage.getItem('bp.lang');
    if (LANGS.includes(x)) L = x;
  } catch (e) {}
  document.documentElement.lang = L === 'pt' ? 'pt-BR' : L;
  window.BP_LANG = L;
  const DICT = {
    'Ficha BP': ['BP Judging Sheet', 'Ficha BP'],
    Torneios: ['Tournaments', 'Torneos'],
    Torneio: ['Tournament', 'Torneo'],
    Consultas: ['Queries', 'Consultas'],
    Guia: ['Guide', 'Guía'],
    Sair: ['Sign out', 'Salir'],
    Armazenamento: ['Storage', 'Almacenamiento'],
    'Modo local': ['Local mode', 'Modo local'],
    '← Torneio': ['← Tournament', '← Torneo'],
    '← Torneios': ['← Tournaments', '← Torneos'],
    Debate: ['Debate', 'Debate'],
    Debates: ['Debates', 'Debates'],
    debates: ['debates', 'debates'],
    Deliberação: ['Deliberation', 'Deliberación'],
    Moção: ['Motion', 'Moción'],
    'Discurso atual': ['Current speech', 'Discurso actual'],
    Iniciar: ['Start', 'Iniciar'],
    Pausar: ['Pause', 'Pausar'],
    Zerar: ['Reset', 'Reiniciar'],
    'Próximo discurso': ['Next speech', 'Siguiente discurso'],
    Falando: ['Speaking', 'Hablando'],
    'Tempo protegido': ['Protected time', 'Tiempo protegido'],
    'POIs liberados': ['POIs open', 'POIs permitidos'],
    'Protegido, final': ['Protected, closing', 'Protegido, final'],
    'Tolerância de 15s': ['15s grace', 'Tolerancia de 15 s'],
    'Estourou o tempo': ['Over time', 'Se pasó del tiempo'],
    'Tempo esgotado': ['Time is up', 'Tiempo agotado'],
    'Hora de votar': ['Time to vote', 'Hora de votar'],
    'Salvando...': ['Saving...', 'Guardando...'],
    Salvo: ['Saved', 'Guardado'],
    'Sem conexão, salvo no aparelho': ['Offline, saved on this device', 'Sin conexión, guardado en el dispositivo'],
    Desfazer: ['Undo', 'Deshacer'],
    'Anotações, deliberação e histórico dos seus debates de British Parliamentary.': [
      'Notes, deliberation and history for your British Parliamentary debates.',
      'Notas, deliberación e historial de tus debates de British Parliamentary.'
    ],
    'Entrar com Google': ['Sign in with Google', 'Entrar con Google'],
    'ou receba um link por e-mail': ['or get a sign-in link by email', 'o recibe un enlace por correo'],
    'seu@email.com': ['you@email.com', 'tu@correo.com'],
    'Enviar link': ['Send link', 'Enviar enlace'],
    'Link enviado. Abra o e-mail neste aparelho.': [
      'Link sent. Open the email on this device.',
      'Enlace enviado. Abre el correo en este dispositivo.'
    ],
    'Trocar armazenamento ou usar sem conta': [
      'Change storage or use without an account',
      'Cambiar almacenamiento o usar sin cuenta'
    ],
    'Modo local não usa login.': ['Local mode does not use sign-in.', 'El modo local no usa inicio de sesión.'],
    'Modo local: os dados ficam só neste navegador. Exporte o JSON de vez em quando como backup.': [
      'Local mode: your data stays only in this browser. Export the JSON now and then as a backup.',
      'Modo local: los datos quedan solo en este navegador. Exporta el JSON de vez en cuando como copia de seguridad.'
    ],
    'Conectado ao Supabase': ['Connected to Supabase', 'Conectado a Supabase'],
    'Usar o seu próprio Supabase': ['Use your own Supabase', 'Usar tu propio Supabase'],
    'Rode o arquivo': ['Run the file', 'Ejecuta el archivo'],
    'no seu projeto e cole aqui a URL e a chave publishable (ou anon). Os detalhes estão no README do projeto.': [
      'in your project and paste the URL and the publishable (or anon) key here. Details are in the project README.',
      'en tu proyecto y pega aquí la URL y la clave publishable (o anon). Los detalles están en el README del proyecto.'
    ],
    'URL do projeto': ['Project URL', 'URL del proyecto'],
    'Chave publishable ou anon': ['Publishable or anon key', 'Clave publishable o anon'],
    'Nunca cole a chave secret ou service_role.': [
      'Never paste the secret or service_role key.',
      'Nunca pegues la clave secret o service_role.'
    ],
    Conectar: ['Connect', 'Conectar'],
    'Usar modo local': ['Use local mode', 'Usar modo local'],
    Fechar: ['Close', 'Cerrar'],
    'Preencha a URL (https://...) e a chave.': [
      'Fill in the URL (https://...) and the key.',
      'Completa la URL (https://...) y la clave.'
    ],
    'Essa é uma chave secreta. Use a publishable ou anon.': [
      'That is a secret key. Use the publishable or anon key.',
      'Esa es una clave secreta. Usa la publishable o anon.'
    ],
    'O armazenamento deste navegador está cheio. Exporte seus dados.': [
      "This browser's storage is full. Export your data.",
      'El almacenamiento de este navegador está lleno. Exporta tus datos.'
    ],
    'Novo torneio': ['New tournament', 'Nuevo torneo'],
    'Editar torneio': ['Edit tournament', 'Editar torneo'],
    'Nenhum torneio ainda. Crie o primeiro e cadastre as rodadas conforme forem acontecendo.': [
      'No tournaments yet. Create the first one and add rounds as they happen.',
      'Aún no hay torneos. Crea el primero y registra las rondas a medida que ocurran.'
    ],
    Nome: ['Name', 'Nombre'],
    Início: ['Start', 'Inicio'],
    Fim: ['End', 'Fin'],
    Local: ['Location', 'Lugar'],
    'Notas (formato, CAP, regras específicas)': [
      'Notes (format, CAP, specific rules)',
      'Notas (formato, CAP, reglas específicas)'
    ],
    Salvar: ['Save', 'Guardar'],
    Cancelar: ['Cancel', 'Cancelar'],
    Editar: ['Edit', 'Editar'],
    'Dê um nome ao torneio': ['Give the tournament a name', 'Ponle un nombre al torneo'],
    'Novo debate:': ['New debate:', 'Nuevo debate:'],
    'Nenhum debate ainda.': ['No debates yet.', 'Aún no hay debates.'],
    'Apagar torneio': ['Delete tournament', 'Borrar torneo'],
    'Apagar torneio?': ['Delete tournament?', '¿Borrar torneo?'],
    'Apaga o torneio e todos os debates dele, de forma permanente. Exporte antes em Consultas se quiser guardar.': [
      'Permanently deletes the tournament and all its debates. Export first in Queries if you want to keep them.',
      'Borra el torneo y todos sus debates de forma permanente. Exporta antes en Consultas si quieres conservarlos.'
    ],
    Apagar: ['Delete', 'Borrar'],
    'Apagar de vez': ['Delete permanently', 'Borrar definitivamente'],
    'Apagar debate': ['Delete debate', 'Borrar debate'],
    'Apagar este debate?': ['Delete this debate?', '¿Borrar este debate?'],
    'Não dá para desfazer.': ['This cannot be undone.', 'No se puede deshacer.'],
    'Torneio não encontrado.': ['Tournament not found.', 'Torneo no encontrado.'],
    'Debate não encontrado': ['Debate not found', 'Debate no encontrado'],
    'Não encontrado': ['Not found', 'No encontrado'],
    'Sem nome': ['Untitled', 'Sin nombre'],
    'sem moção': ['no motion', 'sin moción'],
    'Importar ficha': ['Import sheet', 'Importar ficha'],
    'Importar ficha JSON': ['Import sheet JSON', 'Importar ficha JSON'],
    'Cole o JSON exportado da ficha antiga (ou escolha o arquivo). Vira um debate deste torneio.': [
      'Paste the JSON exported from the old sheet (or pick the file). It becomes a debate in this tournament.',
      'Pega el JSON exportado de la ficha antigua (o elige el archivo). Se convierte en un debate de este torneo.'
    ],
    Importar: ['Import', 'Importar'],
    'JSON inválido': ['Invalid JSON', 'JSON inválido'],
    'Duplicar painel em novo debate': ['Copy panel to a new debate', 'Duplicar panel en un nuevo debate'],
    'com split': ['with split', 'con split'],
    unânime: ['unanimous', 'unánime'],
    'você na minoria': ['you in minority', 'tú en minoría'],
    'como chair': ['as chair', 'como chair'],
    'speak médio dado': ['avg speak given', 'speak medio dado'],
    'argumentos anotados': ['arguments noted', 'argumentos anotados'],
    Preliminares: ['Prelims', 'Preliminares'],
    'Oitavas de final': ['Octofinals', 'Octavos de final'],
    'Quartas de final': ['Quarterfinals', 'Cuartos de final'],
    Semifinal: ['Semifinal', 'Semifinal'],
    Final: ['Final', 'Final'],
    'Outra eliminatória': ['Other elimination round', 'Otra ronda eliminatoria'],
    'Primeiro-Ministro': ['Prime Minister', 'Primer Ministro'],
    'Líder da Oposição': ['Leader of the Opposition', 'Líder de la Oposición'],
    'Vice-PM': ['Deputy PM', 'Viceprimer Ministro'],
    'Vice-Líder': ['Deputy Leader', 'Vicelíder'],
    'Member do Governo': ['Member of Government', 'Miembro de Gobierno'],
    'Member da Oposição': ['Member of Opposition', 'Miembro de Oposición'],
    'Whip do Governo': ['Government Whip', 'Látigo de Gobierno'],
    'Whip da Oposição': ['Opposition Whip', 'Látigo de Oposición'],
    Chair: ['Chair', 'Chair'],
    Wing: ['Wing', 'Wing'],
    'Trainee (não vota)': ['Trainee (no vote)', 'Trainee (no vota)'],
    'Fora do painel': ['Not on panel', 'Fuera del panel'],
    Você: ['You', 'Tú'],
    'Você (chair)': ['You (chair)', 'Tú (chair)'],
    Juiz: ['Judge', 'Juez'],
    'Preparação: fase, painel e nomes': ['Setup: stage, panel and names', 'Preparación: fase, panel y nombres'],
    Fase: ['Stage', 'Fase'],
    Rodada: ['Round', 'Ronda'],
    'Rodada nº': ['Round no.', 'Ronda n.º'],
    'Nome / sala': ['Name / room', 'Nombre / sala'],
    'Info slide': ['Info slide', 'Info slide'],
    'Você neste debate': ['You in this debate', 'Tú en este debate'],
    'Meu papel': ['My role', 'Mi rol'],
    Papel: ['Role', 'Rol'],
    'Outros juízes': ['Other judges', 'Otros jueces'],
    'Adicionar juiz': ['Add judge', 'Agregar juez'],
    'Equipes e oradores': ['Teams and speakers', 'Equipos y oradores'],
    Equipe: ['Team', 'Equipo'],
    Orador: ['Speaker', 'Orador'],
    Ideia: ['Idea', 'Idea'],
    'Nova ideia, Enter': ['New idea, Enter', 'Nueva idea, Enter'],
    Detalhes: ['Details', 'Detalles'],
    Tipo: ['Type', 'Tipo'],
    Construtivo: ['Constructive', 'Constructivo'],
    Resposta: ['Rebuttal', 'Respuesta'],
    Extensão: ['Extension', 'Extensión'],
    Pesagem: ['Weighing', 'Ponderación'],
    POI: ['POI', 'POI'],
    Forte: ['Strong', 'Fuerte'],
    Ok: ['Ok', 'Ok'],
    Fraco: ['Weak', 'Débil'],
    forte: ['strong', 'fuerte'],
    ok: ['ok', 'ok'],
    fraco: ['weak', 'débil'],
    'De pé': ['Stands', 'En pie'],
    Mitigado: ['Mitigated', 'Mitigado'],
    Caiu: ['Fell', 'Cayó'],
    'de pé': ['stands', 'en pie'],
    mitigado: ['mitigated', 'mitigado'],
    caiu: ['fell', 'cayó'],
    'sem veredito': ['no verdict', 'sin veredicto'],
    'Ao fim do debate, este argumento': [
      'At the end of the debate, this argument',
      'Al final del debate, este argumento'
    ],
    'Por que se sustenta (mecanismo)': ['Why it holds (mechanism)', 'Por qué se sostiene (mecanismo)'],
    Impacto: ['Impact', 'Impacto'],
    Nota: ['Note', 'Nota'],
    'Responde a': ['Responds to', 'Responde a'],
    'Escolher argumento...': ['Choose argument...', 'Elegir argumento...'],
    Marcar: ['Mark', 'Marcar'],
    'Argumento apagado': ['Argument deleted', 'Argumento borrado'],
    'Confrontos e comparações': ['Clashes and comparisons', 'Choques y comparaciones'],
    'Cada choque relevante: qual argumento enfrentou qual, se os debatedores compararam ou se você teve que comparar, e quem levou.':
      [
        'Each relevant clash: which argument met which, whether the debaters compared them or you had to, and who won.',
        'Cada choque relevante: qué argumento enfrentó a cuál, si los oradores compararon o tuviste que comparar tú, y quién ganó.'
      ],
    'Argumento A': ['Argument A', 'Argumento A'],
    'Argumento B': ['Argument B', 'Argumento B'],
    'Adicionar confronto': ['Add clash', 'Agregar choque'],
    'Criar confronto': ['Create clash', 'Crear choque'],
    'Nenhum confronto ainda.': ['No clashes yet.', 'Aún no hay choques.'],
    'Escolha dois argumentos diferentes': ['Pick two different arguments', 'Elige dos argumentos distintos'],
    'Os dois argumentos são da mesma equipe': [
      'Both arguments are from the same team',
      'Los dos argumentos son del mismo equipo'
    ],
    'Comparado pelos debatedores': ['Compared by the debaters', 'Comparado por los oradores'],
    'Comparado em parte': ['Partly compared', 'Comparado en parte'],
    'Não comparado, eu comparo': ['Not compared, I compare', 'No comparado, comparo yo'],
    'comparado pelos debatedores': ['compared by the debaters', 'comparado por los oradores'],
    'comparado em parte': ['partly compared', 'comparado en parte'],
    'não comparado, eu comparo': ['not compared, I compare', 'no comparado, comparo yo'],
    'Quem levou:': ['Who won:', 'Quién ganó:'],
    Empate: ['Tie', 'Empate'],
    empate: ['tie', 'empate'],
    'Confronto apagado': ['Clash deleted', 'Choque borrado'],
    Continuar: ['Continue', 'Continuar'],
    '1. Minhas comparativas': ['1. My comparisons', '1. Mis comparaciones'],
    '2. Os outros juízes': ['2. The other judges', '2. Los otros jueces'],
    '3. Resultado do painel': ['3. Panel result', '3. Resultado del panel'],
    '4. Speaker points': ['4. Speaker points', '4. Speaker points'],
    'Ordem do manual: primeiro o ranking, depois os speaker points. Cada comparação é pairwise.': [
      'Manual order: ranking first, then speaker points. Each comparison is pairwise.',
      'Orden del manual: primero el ranking, luego los speaker points. Cada comparación es pairwise.'
    ],
    'Deliberação de 20 minutos; considere votar perto dos 17.': [
      '20-minute deliberation; consider voting around minute 17.',
      'Deliberación de 20 minutos; considera votar cerca del minuto 17.'
    ],
    'Eliminatória: cada juiz indica a campeã. As comparativas continuam úteis para chegar ao seu voto e para a oral.': [
      'Elimination round: each judge names the winner. The comparisons still help you reach your vote and give the oral.',
      'Ronda eliminatoria: cada juez indica al ganador. Las comparaciones siguen sirviendo para llegar a tu voto y para la oral.'
    ],
    'Eliminatória: cada juiz indica as 2 equipes que avançam. As comparativas continuam úteis para chegar ao seu voto e para a oral.':
      [
        'Elimination round: each judge names the 2 teams that advance. The comparisons still help you reach your vote and give the oral.',
        'Ronda eliminatoria: cada juez indica los 2 equipos que avanzan. Las comparaciones siguen sirviendo para llegar a tu voto y para la oral.'
      ],
    'Duelo direto do opening. Só conta o que um fez contra o outro.': [
      'Direct opening duel. Only what each did against the other counts.',
      'Duelo directo de la apertura. Solo cuenta lo que uno hizo contra el otro.'
    ],
    'Mesma bancada. Credite ao CG só o que é exclusivamente novo. Houve faca?': [
      'Same bench. Credit CG only for what is genuinely new. Was there a knife?',
      'Misma bancada. Acredita al CG solo lo que es exclusivamente nuevo. ¿Hubo cuchillo?'
    ],
    'O CO pode responder ao OG; o OG não teve como responder ao CO.': [
      'CO can respond to OG; OG had no chance to respond to CO.',
      'El CO puede responder al OG; el OG no pudo responder al CO.'
    ],
    'O CG respondeu ao OO? Material novo do CG contra o caso do OO é o centro.': [
      "Did CG respond to OO? New CG material against OO's case is the core.",
      '¿El CG respondió al OO? El material nuevo del CG contra el caso del OO es el centro.'
    ],
    'Mesma bancada. Só o novo do CO conta, e precisa ser consistente com o OO.': [
      "Same bench. Only CO's new material counts, and it must be consistent with OO.",
      'Misma bancada. Solo cuenta lo nuevo del CO, y debe ser consistente con el OO.'
    ],
    'Duelo do closing: extensão contra extensão e quem venceu os choques finais.': [
      'Closing duel: extension against extension and who won the final clashes.',
      'Duelo del cierre: extensión contra extensión y quién ganó los choques finales.'
    ],
    Comparação: ['Comparison', 'Comparación'],
    Bancada: ['Bench', 'Bancada'],
    Clara: ['Clear', 'Clara'],
    Apertada: ['Narrow', 'Ajustada'],
    clara: ['clear', 'clara'],
    apertada: ['narrow', 'ajustada'],
    'Atalho: preencher pelas posições': ['Shortcut: fill from positions', 'Atajo: completar por posiciones'],
    'Dê uma posição diferente para cada equipe': [
      'Give each team a different position',
      'Da una posición distinta a cada equipo'
    ],
    Gerar: ['Generate', 'Generar'],
    'Meu ranking': ['My ranking', 'Mi ranking'],
    'Complete os votos de todas as comparações.': [
      'Complete the votes for every comparison.',
      'Completa los votos de todas las comparaciones.'
    ],
    'Complete os votos.': ['Complete the votes.', 'Completa los votos.'],
    'Suas comparações formam um ciclo. Reveja uma delas antes de ir ao painel.': [
      'Your comparisons form a cycle. Review one of them before going to the panel.',
      'Tus comparaciones forman un ciclo. Revisa una antes de ir al panel.'
    ],
    'Votos dele formam um ciclo.': ['Their votes form a cycle.', 'Sus votos forman un ciclo.'],
    'Comparativas dele (opcional)': ['Their comparisons (optional)', 'Sus comparaciones (opcional)'],
    'Raciocínio dele': ['Their reasoning', 'Su razonamiento'],
    'Avançam no voto dele': ['Advancing in their vote', 'Avanzan en su voto'],
    'Campeã no voto dele': ['Winner in their vote', 'Ganador en su voto'],
    'Quem avança no meu voto': ['Who advances in my vote', 'Quién avanza en mi voto'],
    'Quem é campeã no meu voto': ['Who wins in my vote', 'Quién gana en mi voto'],
    'Quem avança': ['Who advances', 'Quién avanza'],
    'Quem é campeã': ['Who wins', 'Quién gana'],
    'Painel só com você. Adicione juízes em Debate, Preparação.': [
      'Panel with only you. Add judges in Debate, Setup.',
      'Panel solo contigo. Agrega jueces en Debate, Preparación.'
    ],
    'Ninguém está marcado como chair. O desempate usa o seu voto até você definir.': [
      'Nobody is marked as chair. Ties use your vote until you set one.',
      'Nadie está marcado como chair. El desempate usa tu voto hasta que definas uno.'
    ],
    Votos: ['Votes', 'Votos'],
    Par: ['Pair', 'Par'],
    aguardando: ['waiting', 'esperando'],
    'empate, chair decide': ['tie, chair decides', 'empate, decide el chair'],
    'Decisão unânime': ['Unanimous decision', 'Decisión unánime'],
    'Decisão unânime.': ['Unanimous decision.', 'Decisión unánime.'],
    'Decisão com split': ['Split decision', 'Decisión dividida'],
    'Vote cada par contestado, sem transitividade.': [
      'Vote each contested pair, no transitivity.',
      'Vota cada par disputado, sin transitividad.'
    ],
    'Empate cíclico, resolvido por Ranked Pairs. Nas margens iguais a ordem é da chair (use Subir).': [
      'Cyclic tie, resolved by Ranked Pairs. On equal margins the chair sets the order (use Move up).',
      'Empate cíclico, resuelto por Ranked Pairs. Con márgenes iguales el orden lo define el chair (usa Subir).'
    ],
    Margem: ['Margin', 'Margen'],
    Travado: ['Locked', 'Fijado'],
    'Pulado, criaria ciclo': ['Skipped, would create a cycle', 'Omitido, crearía un ciclo'],
    Subir: ['Move up', 'Subir'],
    'Final do painel': ['Panel final', 'Final del panel'],
    'incompatível com o ranking': ['does not match the ranking', 'incompatible con el ranking'],
    compatível: ['matches', 'compatible'],
    'empate decidido pelo voto da chair': ["tie broken by the chair's vote", 'empate decidido por el voto del chair'],
    'empate decidido pela chair': ['tie broken by the chair', 'empate decidido por el chair'],
    'diverge de você': ['differs from you', 'difiere de ti'],
    avança: ['advances', 'avanza'],
    avançam: ['advance', 'avanzan'],
    eliminada: ['eliminated', 'eliminado'],
    campeã: ['winner', 'ganador'],
    Campeã: ['Winner', 'Ganador'],
    Avançam: ['Advancing', 'Avanzan'],
    'Escolha a equipe vencedora.': ['Pick the winning team.', 'Elige el equipo ganador.'],
    'Escolha as 2 equipes que avançam.': ['Pick the 2 teams that advance.', 'Elige los 2 equipos que avanzan.'],
    'Registrar speaker points': ['Record speaker points', 'Registrar speaker points'],
    'Preencha as notas para checar.': ['Fill in the scores to check.', 'Completa las notas para verificar.'],
    Faixa: ['Band', 'Rango'],
    'Roteiro da oral adjudication': ['Oral adjudication script', 'Guion de la oral adjudication'],
    'Gerado das suas comparativas e dos votos.': [
      'Built from your comparisons and the votes.',
      'Generado a partir de tus comparaciones y los votos.'
    ],
    Copiar: ['Copy', 'Copiar'],
    'Roteiro copiado': ['Script copied', 'Guion copiado'],
    'Selecione o texto e copie': ['Select the text and copy it', 'Selecciona el texto y cópialo'],
    'Por que cada equipe ficou onde ficou:': [
      'Why each team placed where it did:',
      'Por qué cada equipo quedó donde quedó:'
    ],
    'Por que essa equipe leva esta comparação': [
      'Why this team takes this comparison',
      'Por qué este equipo gana esta comparación'
    ],
    Resultado: ['Result', 'Resultado'],
    Placar: ['Score', 'Marcador'],
    Ação: ['Action', 'Acción'],
    'Exportar tudo (JSON)': ['Export all (JSON)', 'Exportar todo (JSON)'],
    'Importar JSON': ['Import JSON', 'Importar JSON'],
    'CSV debates': ['CSV debates', 'CSV debates'],
    'CSV argumentos': ['CSV arguments', 'CSV argumentos'],
    'CSV speaks': ['CSV speaks', 'CSV speaks'],
    'Buscar (moção, equipe, argumento)': ['Search (motion, team, argument)', 'Buscar (moción, equipo, argumento)'],
    'ex.: apostas, USP, vício': ['e.g. gambling, Oxford, addiction', 'ej.: apuestas, UBA, adicción'],
    'Carregando todos os debates...': ['Loading all debates...', 'Cargando todos los debates...'],
    'Carregando...': ['Loading...', 'Cargando...'],
    'Nada encontrado.': ['Nothing found.', 'No se encontró nada.'],
    'Nenhum.': ['None.', 'Ninguno.'],
    'Posição média por bancada (preliminares)': [
      'Average position by bench (prelims)',
      'Posición media por bancada (preliminares)'
    ],
    'Posição média': ['Average position', 'Posición media'],
    'Speak médio por posição': ['Average speak by position', 'Speak medio por posición'],
    Qualquer: ['Any', 'Cualquiera'],
    Todas: ['All', 'Todas'],
    Todos: ['All', 'Todos'],
    'Arquivo inválido': ['Invalid file', 'Archivo inválido'],
    'Esse JSON não veio do Exportar tudo': [
      'This JSON did not come from Export all',
      'Este JSON no vino de Exportar todo'
    ],
    'sem resposta': ['no rebuttal', 'sin respuesta'],
    'em aberto': ['open', 'abierto'],
    'Como se decide (manual Ottawa WUDC 2027)': [
      'How it is decided (WUDC Ottawa 2027 manual)',
      'Cómo se decide (manual WUDC Ottawa 2027)'
    ],
    'Ordinary intelligent voter: quem persuadiu mais, por argumento fundamentado, dentro das regras.': [
      'Ordinary intelligent voter: who persuaded most, through reasoned argument, within the rules.',
      'Ordinary intelligent voter: quién persuadió más, con argumentos fundamentados, dentro de las reglas.'
    ],
    'Avaliação holística e comparativa. Não existe 1º ou 4º automático.': [
      'Holistic and comparative assessment. There is no automatic 1st or 4th.',
      'Evaluación holística y comparativa. No existe 1.º o 4.º automático.'
    ],
    'Engajamento direto: o OG não vence o OO por uma resposta que o CG fez.': [
      'Direct engagement: OG does not beat OO with a rebuttal CG made.',
      'Interacción directa: el OG no le gana al OO por una respuesta que hizo el CG.'
    ],
    'Argumento implausível não respondido não some, só pesa pouco. Não complete argumentos pela equipe.': [
      'An implausible unanswered argument does not vanish, it just carries little weight. Do not complete arguments for the team.',
      'Un argumento implausible no respondido no desaparece, solo pesa poco. No completes argumentos por el equipo.'
    ],
    Formato: ['Format', 'Formato'],
    '4 equipes de 2: OG e CG defendem a moção, OO e CO se opõem.': [
      '4 teams of 2: OG and CG support the motion, OO and CO oppose it.',
      '4 equipos de 2: OG y CG defienden la moción, OO y CO se oponen.'
    ],
    'Ordem: PM, LO, DPM, DLO, MG, MO, GW, OW. Discursos de 7 minutos.': [
      'Order: PM, LO, DPM, DLO, MG, MO, GW, OW. 7-minute speeches.',
      'Orden: PM, LO, DPM, DLO, MG, MO, GW, OW. Discursos de 7 minutos.'
    ],
    'POIs só entre o minuto 1 e o minuto 6. Cada orador deve aceitar pelo menos um; quem não aceita perde pontos de engajamento.':
      [
        'POIs only between minute 1 and minute 6. Each speaker must take at least one; not taking one costs engagement credit.',
        'POIs solo entre el minuto 1 y el minuto 6. Cada orador debe aceptar al menos uno; quien no acepta pierde puntos de interacción.'
      ],
    'Nas preliminares, sem empate: 1º, 2º, 3º e 4º.': [
      'In prelims there are no ties: 1st, 2nd, 3rd and 4th.',
      'En preliminares no hay empates: 1.º, 2.º, 3.º y 4.º.'
    ],
    'Closing, faca e whip': ['Closing, knifing and whip', 'Cierre, cuchillo y látigo'],
    'Closing só recebe crédito pelo que é exclusivamente novo em relação ao seu opening.': [
      'Closing only gets credit for what is genuinely new relative to its opening.',
      'El cierre solo recibe crédito por lo que es exclusivamente nuevo respecto a su apertura.'
    ],
    'Closing deve ser consistente com o opening, salvo exceções raras (concessão que perde o debate, concessão só para amarrar o closing, squirrel ou contra-prop inválido, fato claramente falso).':
      [
        'Closing must be consistent with its opening, except in rare cases (a concession that loses the debate, a concession made only to box in the closing, a squirrel or invalid counter-prop, a clearly false fact).',
        'El cierre debe ser consistente con la apertura, salvo excepciones raras (concesión que pierde el debate, concesión solo para atar al cierre, squirrel o contrapropuesta inválida, hecho claramente falso).'
      ],
    'Whip pode trazer resposta nova, explicação, exemplo, enquadramento e pesagem. Material novo não responsivo que muda a direção do caso é ignorado.':
      [
        'The whip may bring new rebuttal, explanation, examples, framing and weighing. New non-responsive material that changes the direction of the case is ignored.',
        'El látigo puede traer respuesta nueva, explicación, ejemplos, encuadre y ponderación. El material nuevo no responsivo que cambia la dirección del caso se ignora.'
      ],
    'Painel, votos e split': ['Panel, votes and splits', 'Panel, votos y split'],
    'Wings valem o mesmo que a chair. Trainees não votam.': [
      'Wings count the same as the chair. Trainees do not vote.',
      'Los wings valen lo mismo que el chair. Los trainees no votan.'
    ],
    'Sem unanimidade: voto em cada comparação contestada; maioria decide, chair desempata. Nada de transitividade.': [
      'No consensus: vote on each contested comparison; majority decides, chair breaks ties. No transitivity.',
      'Sin unanimidad: voto en cada comparación disputada; decide la mayoría, desempata el chair. Nada de transitividad.'
    ],
    'Ciclo: método Ranked Pairs (margem, desempate da chair, travar do topo pulando o que fecha ciclo).': [
      'Cycle: Ranked Pairs method (margin, chair tiebreak, lock from the top skipping anything that closes a cycle).',
      'Ciclo: método Ranked Pairs (margen, desempate del chair, fijar desde arriba omitiendo lo que cierra el ciclo).'
    ],
    'Eliminatórias: o app usa a prática comum de cada juiz indicar as equipes que avançam (2, ou 1 na final). Confira no briefing do torneio se a regra é outra.':
      [
        'Elimination rounds: the app follows the common practice of each judge naming the teams that advance (2, or 1 in the final). Check the tournament briefing in case the rule differs.',
        'Rondas eliminatorias: la app sigue la práctica común de que cada juez indique los equipos que avanzan (2, o 1 en la final). Revisa el briefing del torneo por si la regla es otra.'
      ],
    'Como anotar sem anotar tudo': ['How to take notes without writing everything', 'Cómo anotar sin anotarlo todo'],
    'Uma linha por ideia: a afirmação em 3 a 6 palavras.': [
      'One line per idea: the claim in 3 to 6 words.',
      'Una línea por idea: la afirmación en 3 a 6 palabras.'
    ],
    'Marque a qualidade na hora.': ['Mark the quality on the spot.', 'Marca la calidad en el momento.'],
    'Mecanismo e impacto só quando existem de fato.': [
      'Mechanism and impact only when they actually exist.',
      'Mecanismo e impacto solo cuando realmente existen.'
    ],
    'Toda resposta aponta para o argumento que ataca.': [
      'Every rebuttal points to the argument it attacks.',
      'Toda respuesta apunta al argumento que ataca.'
    ],
    'No closing: isso é novo ou é o opening de novo?': [
      'In closing: is this new or the opening again?',
      'En el cierre: ¿esto es nuevo o es la apertura otra vez?'
    ],
    'Choque relevante vira confronto: comparado ou não, e quem levou.': [
      'A relevant clash becomes a clash entry: compared or not, and who won.',
      'Un choque relevante se registra: comparado o no, y quién ganó.'
    ],
    'Escala de speaker points': ['Speaker point scale', 'Escala de speaker points'],
    'Possivelmente um dos melhores discursos já feitos; argumentos impecáveis.': [
      'Plausibly one of the best speeches ever given; flawless arguments.',
      'Posiblemente uno de los mejores discursos jamás dados; argumentos impecables.'
    ],
    'Entre os melhores do torneio; sem falhas relevantes.': [
      'Among the best in the tournament; no meaningful flaws.',
      'Entre los mejores del torneo; sin fallas relevantes.'
    ],
    'Argumentos brilhantes nas questões centrais.': [
      'Brilliant arguments on the central issues.',
      'Argumentos brillantes en las cuestiones centrales.'
    ],
    'Engaja o núcleo, muito convincente, sem lacunas lógicas.': [
      'Engages the core, very persuasive, no logical gaps.',
      'Aborda el núcleo, muy convincente, sin vacíos lógicos.'
    ],
    'Ataca as questões centrais com explicações fortes.': [
      'Tackles the central issues with strong explanations.',
      'Ataca las cuestiones centrales con explicaciones sólidas.'
    ],
    'Relevante, bem feito e explicado; vulnerável a boas respostas.': [
      'Relevant, well made and explained; vulnerable to good rebuttals.',
      'Relevante, bien hecho y explicado; vulnerable a buenas respuestas.'
    ],
    'Quase todo relevante; às vezes raso ou periférico.': [
      'Almost all relevant; sometimes shallow or peripheral.',
      'Casi todo relevante; a veces superficial o periférico.'
    ],
    'Deixa questão central de fora; lógico porém simplista.': [
      'Misses a central issue; logical but simplistic.',
      'Deja fuera una cuestión central; lógico pero simplista.'
    ],
    'Lacunas lógicas regulares; às vezes difícil de seguir.': [
      'Regular logical gaps; sometimes hard to follow.',
      'Vacíos lógicos frecuentes; a veces difícil de seguir.'
    ],
    'Quase tudo com lacunas sérias; difícil de creditar.': [
      'Almost everything has serious gaps; hard to credit.',
      'Casi todo con vacíos serios; difícil de acreditar.'
    ],
    'Algo relevante; muitas vezes confuso.': [
      'Some relevance; often confusing.',
      'Algo relevante; muchas veces confuso.'
    ],
    'Algumas afirmações relevantes; explicações falhas.': [
      'A few relevant claims; flawed explanations.',
      'Algunas afirmaciones relevantes; explicaciones deficientes.'
    ],
    'Afirmações sem formato de argumento.': [
      'Claims not structured as arguments.',
      'Afirmaciones sin forma de argumento.'
    ],
    'Comentários, não argumentos.': ['Comments, not arguments.', 'Comentarios, no argumentos.'],
    'Conteúdo irrelevante e confuso.': ['Irrelevant and confusing content.', 'Contenido irrelevante y confuso.'],
    'respondido, avaliar': ['answered, assess', 'respondido, evaluar'],
    'sem nota': ['no rating', 'sin nota'],
    '(próprio ranking)': ['(own ranking)', '(ranking propio)'],
    Treinos: ['Practices', 'Entrenamientos'],
    Treino: ['Practice', 'Entrenamiento'],
    'Novo treino': ['New practice', 'Nuevo entrenamiento'],
    'Editar treino': ['Edit practice', 'Editar entrenamiento'],
    'Apagar treino': ['Delete practice', 'Borrar entrenamiento'],
    'Apagar treino?': ['Delete practice?', '¿Borrar entrenamiento?'],
    'Apaga o treino e todos os debates dele, de forma permanente. Exporte antes em Consultas se quiser guardar.': [
      'Permanently deletes the practice and all its debates. Export first in Queries if you want to keep them.',
      'Borra el entrenamiento y todos sus debates de forma permanente. Exporta antes en Consultas si quieres conservarlos.'
    ],
    'Interno da SD': ['Internal (own debating society)', 'Interno de la sociedad de debates'],
    'Parceria com outra SD': ['Joint with another debating society', 'En alianza con otra sociedad de debates'],
    Externo: ['External', 'Externo'],
    'Quem organiza': ['Organized by', 'Quién organiza'],
    'Sociedade parceira': ['Partner debating society', 'Sociedad de debates aliada'],
    'ex.: SDUFRJ, Liga, torneio-treino': [
      'e.g. another debating society, a league, a practice tournament',
      'ej.: otra sociedad de debates, una liga, un torneo de práctica'
    ],
    'ex.: SDUSP': ['e.g. partner debating society', 'ej.: sociedad de debates aliada'],
    'Nome (opcional)': ['Name (optional)', 'Nombre (opcional)'],
    'ex.: Treino de quinta': ['e.g. Thursday practice', 'ej.: Entrenamiento del jueves'],
    Data: ['Date', 'Fecha'],
    'Notas (formato, moções, quem participou)': [
      'Notes (format, motions, who took part)',
      'Notas (formato, mociones, quiénes participaron)'
    ],
    'Nenhum treino desse tipo.': ['No practices of this type.', 'No hay entrenamientos de este tipo.'],
    'Nenhum treino ainda. Registre treinos internos da SD, em parceria com outras SDs ou externos.': [
      'No practices yet. Log internal practices of your debating society, joint practices with other debating societies, or external ones.',
      'Aún no hay entrenamientos. Registra entrenamientos internos de tu sociedad de debates, en alianza con otras sociedades de debates o externos.'
    ],
    '← Treino': ['← Practice', '← Entrenamiento'],
    '← Treinos': ['← Practices', '← Entrenamientos'],
    'Formato eliminatória (2 avançam)': ['Elimination format (2 advance)', 'Formato eliminatoria (avanzan 2)'],
    'Formato final (1 campeã)': ['Final format (1 winner)', 'Formato final (1 ganador)'],
    Evento: ['Event', 'Evento'],
    'Treinos (todos)': ['Practices (all)', 'Entrenamientos (todos)'],
    'Torneio ou treino': ['Tournament or practice', 'Torneo o entrenamiento'],
    'NÃO SALVO: armazenamento do navegador cheio. Exporte agora.': [
      'NOT SAVED: browser storage is full. Export now.',
      'NO GUARDADO: el almacenamiento del navegador está lleno. Exporta ahora.'
    ],
    'Sem conexão. Salvo neste aparelho; envio quando a internet voltar.': [
      'Offline. Saved on this device; will sync when the connection returns.',
      'Sin conexión. Guardado en este dispositivo; se enviará cuando vuelva internet.'
    ],
    'Sem conexão: aberto com a cópia salva neste aparelho': [
      'Offline: opened from the copy saved on this device',
      'Sin conexión: abierto con la copia guardada en este dispositivo'
    ],
    'Modo local: faça backup.': ['Local mode: back up your data.', 'Modo local: haz una copia de seguridad.'],
    'Seus debates estão só neste navegador. Limpar os dados do navegador, usar janela anônima ou (no Safari) ficar 7 dias sem abrir o app pode apagá-los.':
      [
        'Your debates live only in this browser. Clearing browser data, using a private window or (on Safari) not opening the app for 7 days can erase them.',
        'Tus debates están solo en este navegador. Borrar los datos del navegador, usar una ventana privada o (en Safari) pasar 7 días sin abrir la app puede borrarlos.'
      ],
    'Ir para Consultas e exportar o JSON': ['Go to Queries and export the JSON', 'Ir a Consultas y exportar el JSON'],
    'Nenhum backup feito ainda.': ['No backup yet.', 'Aún no hay copia de seguridad.'],
    'Mudar para tema claro': ['Switch to light theme', 'Cambiar a tema claro'],
    'Mudar para tema escuro': ['Switch to dark theme', 'Cambiar a tema oscuro'],
    'Seu nome': ['Your name', 'Tu nombre'],
    'Seu papel': ['Your role', 'Tu rol'],
    'Você abriu o arquivo direto do computador.': [
      'You opened the file directly from your computer.',
      'Abriste el archivo directamente desde tu computadora.'
    ],
    'Assim o navegador pode não guardar suas anotações com segurança e o app não funciona sem internet. Use o endereço publicado do app.':
      [
        "This way the browser may not keep your notes safely and the app does not work offline. Use the app's published address.",
        'Así el navegador puede no guardar tus notas de forma segura y la app no funciona sin internet. Usa la dirección publicada de la app.'
      ]
  };
  Object.assign(DICT, (window.BP_I18N_EXTRA && window.BP_I18N_EXTRA.dict) || {});
  const ord = n =>
    L === 'en' ? n + ['th', 'st', 'nd', 'rd'][n % 10 > 3 || Math.floor((n % 100) / 10) === 1 ? 0 : n % 10] : n + 'º';
  const W = {
    en: {
      ' sobre ': ' over ',
      ' por ': ' by ',
      ' com desempate da chair': ' with chair tiebreak',
      '(maioria: ': '(majority: ',
      '(levou)': '(won)',
      '(perdeu)': '(lost)',
      '(empate)': '(tie)',
      '(forte)': '(strong)',
      '(fraco)': '(weak)',
      '(ok)': '(ok)'
    },
    es: {
      ' sobre ': ' sobre ',
      ' por ': ' por ',
      ' com desempate da chair': ' con desempate del chair',
      '(maioria: ': '(mayoría: ',
      '(levou)': '(ganó)',
      '(perdeu)': '(perdió)',
      '(empate)': '(empate)',
      '(forte)': '(fuerte)',
      '(fraco)': '(débil)',
      '(ok)': '(ok)'
    }
  };
  const words = s => {
    for (const [a, b] of Object.entries(W[L])) s = s.split(a).join(b);
    return s
      .replace(/Você/g, L === 'en' ? 'You' : 'Tú')
      .replace(/\bJuiz (\d+)/g, (_, n) => (L === 'en' ? 'Judge ' : 'Juez ') + n);
  };
  const and = s => s.split(' e ').join(L === 'en' ? ' and ' : ' y ');
  const pick = (en, es) => (L === 'en' ? en : es);
  // [regex, (m,t)=>string]
  const RULES = [
    [/^(.+) \(próprio ranking\)(.*)$/, m => words(m[1]) + pick(' (own ranking)', ' (ranking propio)') + m[2]],
    [/^(.+) \((\d+)\)$/, (m, t) => t(m[1]) + ' (' + m[2] + ')'],
    [
      /^Último backup há (\d+) dias\.$/,
      m => pick('Last backup ' + m[1] + ' days ago.', 'Última copia hace ' + m[1] + ' días.')
    ],
    [/^NÃO SALVO: (.+)$/, (m, t) => pick('NOT SAVED: ', 'NO GUARDADO: ') + t(m[1])],
    [/^Nome do juiz (\d+)$/, m => pick('Judge ' + m[1] + ' name', 'Nombre del juez ' + m[1])],
    [/^Papel do juiz (\d+)$/, m => pick('Judge ' + m[1] + ' role', 'Rol del juez ' + m[1])],
    [/^Juiz (\d+)$/, m => pick('Judge ', 'Juez ') + m[1]],
    [/^Wing (\d+)$/, m => 'Wing ' + m[1]],
    [/^(\d+) ideias$/, m => m[1] + pick(' ideas', ' ideas')],
    [/^(\d+) fortes$/, m => m[1] + pick(' strong', ' fuertes')],
    [/^(\d+) caíram$/, m => m[1] + pick(' fell', ' cayeron')],
    [/^(\d+) de pé$/, m => m[1] + pick(' standing', ' en pie')],
    [/^(\d+) debates$/, m => m[1] + ' debates'],
    [
      /^(\d+) debates com resultado completo\.$/,
      m => m[1] + pick(' debates with a complete result.', ' debates con resultado completo.')
    ],
    [/^(\d+)\/(\d+) campeã$/, m => m[1] + '/' + m[2] + pick(' winner', ' ganador')],
    [/^(\d+)\/(\d+) avançam$/, m => m[1] + '/' + m[2] + pick(' advance', ' avanzan')],
    [/^(\d)º$/, m => ord(+m[1])],
    [/^(\d)º lugares$/, m => ord(+m[1]) + pick(' places', ' puestos')],
    [/^Rodada (\d+)$/, m => pick('Round ', 'Ronda ') + m[1]],
    [/^rodada (\d+)$/, m => pick('round ', 'ronda ') + m[1]],
    [/^(.+) R(\d+)$/, (m, t) => t(m[1]) + ' R' + m[2]],
    [/^(PM|LO|DPM|DLO|MG|MO|GW|OW) (.+)$/, (m, t) => m[1] + ' ' + t(m[2])],
    [/^Nova ideia em (\S+)$/, m => pick('New idea in ', 'Nueva idea en ') + m[1]],
    [
      /^Por que (\S+) leva esta comparação$/,
      m => pick('Why ' + m[1] + ' takes this comparison', 'Por qué ' + m[1] + ' gana esta comparación')
    ],
    [/^Faltam (\d+) votos\.$/, m => pick(m[1] + ' votes missing.', 'Faltan ' + m[1] + ' votos.')],
    [/^Faltam (\d+) comparações\.$/, m => pick(m[1] + ' comparisons missing.', 'Faltan ' + m[1] + ' comparaciones.')],
    [/^Faltam votos de: (.+)\.$/, m => pick('Missing votes from: ', 'Faltan votos de: ') + words(m[1]) + '.'],
    [/^Faltam votos\. (.+)$/, m => pick('Missing votes. ', 'Faltan votos. ') + words(m[1])],
    [
      /^Escolha (a equipe vencedora|as 2 equipes que avançam)\.(?: Dica: pelo seu ranking seriam (.+)\.)?$/,
      (m, t) =>
        t('Escolha ' + m[1] + '.') +
        (m[2] ? pick(' Hint: by your ranking it would be ', ' Pista: según tu ranking serían ') + and(m[2]) + '.' : '')
    ],
    [
      /^Empate na linha de corte entre (.+)\. A chair escolhe (\d+):$/,
      m =>
        pick(
          'Tie at the cut-off between ' + m[1] + '. The chair picks ' + m[2] + ':',
          'Empate en la línea de corte entre ' + m[1] + '. El chair elige ' + m[2] + ':'
        )
    ],
    [/^Em confronto: (.+)$/, m => pick('In clash: ', 'En choque: ') + words(m[1])],
    [/^Respostas recebidas: (.+)$/, m => pick('Rebuttals received: ', 'Respuestas recibidas: ') + words(m[1])],
    [/^responde (.+)$/, m => pick('responds to ', 'responde a ') + m[1]],
    [
      /^(\S+) responde (\S+) \((.*)\): alvo (.+)$/,
      (m, t) =>
        m[1] +
        pick(' responds to ', ' responde a ') +
        m[2] +
        ' (' +
        m[3] +
        '): ' +
        pick('target ', 'objetivo ') +
        t(m[4])
    ],
    [/^Confronto (\S+) x (\S+):$/, m => pick('Clash ', 'Choque ') + m[1] + ' x ' + m[2] + ':'],
    [
      /^· (comparado pelos debatedores|comparado em parte|não comparado, eu comparo)(.*)$/,
      (m, t) => '· ' + t(m[1]) + m[2]
    ],
    [/^· (.+)$/, (m, t) => '· ' + t(m[1])],
    [
      /^Argumentos que batem com "(.*)"$/,
      m => pick('Arguments matching "' + m[1] + '"', 'Argumentos que coinciden con "' + m[1] + '"')
    ],
    [
      /^Importados (\d+) torneios e (\d+) debates$/,
      m =>
        pick(
          'Imported ' + m[1] + ' tournaments and ' + m[2] + ' debates',
          'Importados ' + m[1] + ' torneos y ' + m[2] + ' debates'
        )
    ],
    [/^Erro ao carregar: (.*)$/, m => pick('Error loading: ', 'Error al cargar: ') + m[1]],
    [/^Erro: (.*)$/, m => 'Error: ' + m[1]],
    [/^Não foi possível enviar: (.*)$/, m => pick('Could not send: ', 'No se pudo enviar: ') + m[1]],
    [/^Moção:\s?(.*)$/, m => pick('Motion: ', 'Moción: ') + m[1]],
    [/^(Campeã|Avançam): (.+)\.$/, (m, t) => t(m[1]) + ': ' + and(m[2]) + '.'],
    [
      /^Decisão com split\. Votos: (.+)\.$/,
      m => pick('Split decision. Votes: ', 'Decisión dividida. Votos: ') + m[1] + '.'
    ],
    [/^Decisão com split\. (.+)$/, m => pick('Split decision. ', 'Decisión dividida. ') + words(m[1])],
    [/^Resultado: (.+)\.$/, m => pick('Result: ', 'Resultado: ') + m[1].replace(/(\d)º/g, (_, n) => ord(+n)) + '.'],
    [
      /^Empate cíclico resolvido por Ranked Pairs\. Comparação ignorada: (.+)\.$/,
      m =>
        pick(
          'Cyclic tie resolved by Ranked Pairs. Comparison dropped: ',
          'Empate cíclico resuelto por Ranked Pairs. Comparación omitida: '
        ) +
        words(m[1]) +
        '.'
    ],
    [/^- (\S+) sobre (\S+)(.*)$/, m => '- ' + m[1] + pick(' over ', ' sobre ') + m[2] + m[3]]
  ];
  const cache = new Map();
  if (window.BP_I18N_EXTRA && window.BP_I18N_EXTRA.rules) RULES.unshift(...window.BP_I18N_EXTRA.rules(pick));
  function core(s) {
    const d = DICT[s];
    if (d) return d[L === 'en' ? 0 : 1];
    for (const [re, f] of RULES) {
      const m = s.match(re);
      if (m) {
        const r = f(m, tx);
        if (r != null && r !== s) return r;
      }
    }
    for (const sep of [' · ', ': ', ', ']) {
      if (s.includes(sep)) {
        const parts = s.split(sep),
          tp = parts.map(tx);
        if (tp.some((p, i) => p !== parts[i])) return tp.join(sep);
      }
    }
    return s;
  }
  function tx(s) {
    if (L === 'pt' || !s || !/[A-Za-zÀ-úº]/.test(s)) return s;
    if (cache.has(s)) return cache.get(s);
    let r;
    if (s.includes('\n')) r = s.split('\n').map(tx).join('\n');
    else {
      const m = s.match(/^(\s*)([\s\S]*?)(\s*)$/);
      r = m[1] + core(m[2]) + m[3];
    }
    if (cache.size > 5000) cache.clear();
    cache.set(s, r);
    return r;
  }
  window.BP_T = tx;
  if (L === 'pt') return;
  document.title = tx(document.title);
  const ATTRS = ['placeholder', 'title', 'aria-label'];
  const skip = n => {
    const p = n.parentElement;
    return !p || /^(SCRIPT|STYLE|TEXTAREA)$/.test(p.tagName) || p.closest('[data-noi18n]');
  };
  function doText(n) {
    if (skip(n)) return;
    const t = tx(n.data);
    if (t !== n.data) n.data = t;
  }
  function doAttr(e) {
    for (const a of ATTRS) {
      const v = e.getAttribute(a);
      if (v) {
        const t = tx(v);
        if (t !== v) e.setAttribute(a, t);
      }
    }
  }
  function walk(n) {
    if (n.nodeType === 3) return doText(n);
    if (n.nodeType !== 1) return;
    if (/^(SCRIPT|STYLE|TEXTAREA)$/.test(n.tagName)) {
      if (n.tagName === 'TEXTAREA') doAttr(n);
      return;
    }
    doAttr(n);
    for (const c of n.childNodes) walk(c);
  }
  walk(document.body);
  new MutationObserver(ms => {
    for (const m of ms) {
      if (m.type === 'characterData') doText(m.target);
      else if (m.type === 'attributes') doAttr(m.target);
      else m.addedNodes.forEach(walk);
    }
  }).observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ATTRS
  });
})();
