import { Plot } from "../entities/plot/Plot";
import { CropType, PlotState } from "../entities/plot/plotTypes";
import { getCurrentDay, getPlotState, addMoney, setState } from "../state/gameState";

const PLOT_ID = "main-plot";
let plotInstance: Plot | null = null;

export function getPlot(): Plot {
  if (!plotInstance) {
    plotInstance = new Plot(PLOT_ID);
  }
  return plotInstance;
}

export function plotCrop(cropType: CropType): void {
  const plot = getPlot();
  const day = getCurrentDay();
  plot.plant(cropType, day);
  syncPlotToState();
}

export function harvestCrop(): { cropType: CropType; sellValue: number } {
  const plot = getPlot();
  const result = plot.harvest();
  syncPlotToState();
  addMoney(result.sellValue);
  return result;
}

export function advanceCropGrowth(): void {
  const plot = getPlot();
  const day = getCurrentDay();
  plot.updateForDay(day);
  syncPlotToState();
}

export function syncPlotToState(): void {
  const plot = getPlot();
  setState({
    plot: {
      id: PLOT_ID,
      state: plot.getState() as PlotState,
      crop: plot.getCrop(),
      plantedDay: plot.getPlantedDay(),
    } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
  });
}

export function loadPlotFromState(): void {
  const state = getPlotState();
  plotInstance = Plot.fromJSON({
    id: PLOT_ID,
    state: state.state as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    crop: state.crop as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    plantedDay: state.plantedDay,
  });
}

export function resetCropSystem(): void {
  const plot = getPlot();
  plot.reset();
  syncPlotToState();
}