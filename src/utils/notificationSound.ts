/**
 * Som de notificação sintetizado na hora (Web Audio API) — um "ding" curto de dois
 * tons, sem precisar embarcar um arquivo de áudio no build. Dois pequenos cuidados:
 *
 * 1. Política de autoplay do navegador: antes de qualquer interação do usuário na
 *    página, o navegador pode recusar a tocar som. Isso é esperado (não é um erro do
 *    sistema) — o aviso visual já cumpre o papel sozinho, então falha aqui é só
 *    engolida, sem notificar o usuário de novo por causa disso.
 * 2. Um `AudioContext` por chamada é suficiente pro uso aqui (um som ocasional, não
 *    um player) — não precisa manter instância viva entre notificações.
 */
export function playNotificationSound(): void {
  try {
    const AudioContextCtor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;

    const ctx = new AudioContextCtor();
    const now = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);

    // Dois tons subindo (ding-dong), como a maioria dos avisos de notificação.
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, now);
    oscillator.frequency.setValueAtTime(1175, now + 0.11);

    // Rampa exponencial em vez de ligar/desligar seco — evita o estalo audível
    // de uma transição abrupta de volume.
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.25, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    oscillator.start(now);
    oscillator.stop(now + 0.35);
    oscillator.onended = () => ctx.close();
  } catch {
    // Ver nota 1 acima — silencioso de propósito.
  }
}
