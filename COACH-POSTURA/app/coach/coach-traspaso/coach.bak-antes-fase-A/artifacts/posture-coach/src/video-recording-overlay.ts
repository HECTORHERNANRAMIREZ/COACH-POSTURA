export type RecordingAngleReading = {
  label: string;
  value: number | null;
  target: string;
  unit?: '°' | '';
};

export type RecordingJointReading = {
  label: string;
  value: number | null;
  status?: string;
};

export type VideoRecordingHudState = {
  exercise: string | null;
  hasEvaluationCounter: boolean;
  correctRepetitions: number;
  incorrectRepetitions: number;
  liveAngleReadings: RecordingAngleReading[];
  dipJointReadings: RecordingJointReading[];
  pullupJointReadings: RecordingJointReading[];
};

export const EMPTY_VIDEO_RECORDING_HUD: VideoRecordingHudState = {
  exercise: null,
  hasEvaluationCounter: false,
  correctRepetitions: 0,
  incorrectRepetitions: 0,
  liveAngleReadings: [],
  dipJointReadings: [],
  pullupJointReadings: [],
};

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + width - r, y);
  context.quadraticCurveTo(x + width, y, x + width, y + r);
  context.lineTo(x + width, y + height - r);
  context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  context.lineTo(x + r, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.closePath();
}

function fillPanel(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill: string,
  stroke: string,
) {
  roundedRect(context, x, y, width, height, radius);
  context.fillStyle = fill;
  context.fill();
  context.strokeStyle = stroke;
  context.lineWidth = 1;
  context.stroke();
}

function fitText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  if (context.measureText(text).width <= maxWidth) return text;
  let fitted = text;
  while (fitted.length > 1 && context.measureText(`${fitted}…`).width > maxWidth) {
    fitted = fitted.slice(0, -1);
  }
  return `${fitted}…`;
}

function drawRepetitionCounter(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  scale: number,
  correct: number,
  incorrect: number,
) {
  const margin = 10 * scale;
  const panelWidth = 208 * scale;
  const gap = 5 * scale;
  const cardWidth = (panelWidth - gap) / 2;
  const cardHeight = 54 * scale;
  const y = Math.min(50 * scale, Math.max(8 * scale, height - cardHeight - margin));
  const cards = [
    { label: 'CORRECTAS', value: correct, color: '#7bff9d' },
    { label: 'INCORRECTAS', value: incorrect, color: '#ff8b8b' },
  ];

  cards.forEach((card, index) => {
    const x = margin + index * (cardWidth + gap);
    fillPanel(
      context,
      x,
      y,
      cardWidth,
      cardHeight,
      10 * scale,
      'rgba(8, 18, 32, 0.84)',
      'rgba(255, 255, 255, 0.2)',
    );
    context.textAlign = 'left';
    context.textBaseline = 'alphabetic';
    context.fillStyle = 'rgba(234, 242, 250, 0.82)';
    context.font = `800 ${Math.max(8, 5.5 * scale)}px system-ui, sans-serif`;
    context.fillText(card.label, x + 8 * scale, y + 15 * scale);
    context.fillStyle = card.color;
    context.font = `750 ${Math.max(18, 19 * scale)}px system-ui, sans-serif`;
    context.fillText(String(card.value), x + 8 * scale, y + 43 * scale);
  });
}

function drawReadingsPanel(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  scale: number,
  title: string,
  subtitle: string,
  readings: Array<{
    label: string;
    value: number | null;
    target?: string;
    unit?: '°' | '';
    status?: string;
  }>,
  columns: number,
) {
  if (readings.length === 0) return;

  const margin = 10 * scale;
  const panelWidth = 216 * scale;
  const padding = 6 * scale;
  const headingHeight = 18 * scale;
  const gap = 4 * scale;
  const cellHeight = 43 * scale;
  const rows = Math.ceil(readings.length / columns);
  const panelHeight = padding * 2 + headingHeight + gap + rows * cellHeight + (rows - 1) * gap;
  const x = Math.max(margin, width - panelWidth - margin);
  const y = Math.max(margin, height - panelHeight - margin);

  fillPanel(
    context,
    x,
    y,
    panelWidth,
    panelHeight,
    12 * scale,
    'rgba(8, 18, 32, 0.88)',
    title === 'EXTREMIDADES'
      ? 'rgba(255, 216, 138, 0.52)'
      : 'rgba(255, 255, 255, 0.24)',
  );

  const contentX = x + padding;
  const contentWidth = panelWidth - padding * 2;
  context.textBaseline = 'alphabetic';
  context.textAlign = 'left';
  context.fillStyle = title === 'EXTREMIDADES'
    ? 'rgba(255, 226, 161, 0.86)'
    : 'rgba(220, 232, 244, 0.88)';
  context.font = `800 ${Math.max(7, 5.4 * scale)}px system-ui, sans-serif`;
  context.fillText(title, contentX, y + padding + 7 * scale);
  context.textAlign = 'right';
  context.fillStyle = title === 'EXTREMIDADES' ? '#ffe3a1' : '#b9d1e6';
  context.font = `800 ${Math.max(7, 5 * scale)}px system-ui, sans-serif`;
  context.fillText(
    fitText(context, subtitle.toUpperCase(), contentWidth * 0.54),
    x + panelWidth - padding,
    y + padding + 7 * scale,
  );

  const cellGap = 4 * scale;
  const cellWidth = (contentWidth - cellGap * (columns - 1)) / columns;
  const gridY = y + padding + headingHeight + gap;
  readings.forEach((reading, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const cellX = contentX + column * (cellWidth + cellGap);
    const cellY = gridY + row * (cellHeight + gap);
    fillPanel(
      context,
      cellX,
      cellY,
      cellWidth,
      cellHeight,
      6 * scale,
      'rgba(255, 255, 255, 0.075)',
      'rgba(255, 255, 255, 0.18)',
    );

    context.textAlign = 'center';
    context.textBaseline = 'alphabetic';
    context.fillStyle = 'rgba(222, 234, 245, 0.78)';
    context.font = `800 ${Math.max(6, 4.5 * scale)}px system-ui, sans-serif`;
    context.fillText(
      fitText(context, reading.label.toUpperCase(), cellWidth - 8 * scale),
      cellX + cellWidth / 2,
      cellY + 10 * scale,
    );
    context.fillStyle = 'rgba(242, 247, 252, 0.98)';
    context.font = `700 ${Math.max(12, 11 * scale)}px system-ui, sans-serif`;
    const value = reading.value === null
      ? (reading.status ?? '—')
      : `${reading.value}${reading.unit ?? '°'}`;
    context.fillText(
      fitText(context, value, cellWidth - 8 * scale),
      cellX + cellWidth / 2,
      cellY + 27 * scale,
    );
    if (reading.target) {
      context.fillStyle = 'rgba(255, 226, 161, 0.82)';
      context.font = `500 ${Math.max(5, 3.8 * scale)}px system-ui, sans-serif`;
      context.fillText(
        fitText(context, reading.target, cellWidth - 8 * scale),
        cellX + cellWidth / 2,
        cellY + 37 * scale,
      );
    }
  });
}

export function drawVideoRecordingHud(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: VideoRecordingHudState,
) {
  if (!width || !height) return;
  context.save();
  context.textAlign = 'left';
  context.textBaseline = 'alphabetic';

  // El ancho/alto de referencia mantiene los paneles legibles tanto en clips
  // verticales como panorámicos y en exportaciones de distintas resoluciones.
  const scale = Math.max(0.55, Math.min(5, width / 640, height / 360));

  if (state.hasEvaluationCounter) {
    drawRepetitionCounter(
      context,
      width,
      height,
      scale,
      state.correctRepetitions,
      state.incorrectRepetitions,
    );
  }

  if (state.exercise === 'fondos') {
    drawReadingsPanel(
      context,
      width,
      height,
      scale,
      'PUNTOS SEGUIDOS',
      'ARTICULACIONES',
      state.dipJointReadings,
      Math.min(4, state.dipJointReadings.length),
    );
  } else if (
    state.exercise === 'dominadas'
    || state.exercise === 'dominadas-supinas'
    || state.exercise === 'dominadas-comando'
  ) {
    drawReadingsPanel(
      context,
      width,
      height,
      scale,
      'ARTICULACIONES',
      'IZQ. + DER.',
      state.pullupJointReadings,
      Math.min(4, state.pullupJointReadings.length),
    );
  } else {
    drawReadingsPanel(
      context,
      width,
      height,
      scale,
      'EXTREMIDADES',
      'GRADOS EN VIVO',
      state.liveAngleReadings,
      state.liveAngleReadings.length > 3 ? 3 : 2,
    );
  }

  context.restore();
}