import { PlotState, CropType, type Crop } from "./plotTypes";
import { CROP_CONFIG } from "../../data/cropSchema";

export interface PlotJSON {
  id: string;
  state: PlotState;
  crop: Crop | null;
  plantedDay: number | null;
}

export class Plot {
  private _id: string;
  private _state: PlotState;
  private _crop: Crop | null;
  private _plantedDay: number | null;

  constructor(id: string) {
    this._id = id;
    this._state = PlotState.EMPTY;
    this._crop = null;
    this._plantedDay = null;
  }

  getState(): PlotState {
    return this._state;
  }

  getCrop(): Crop | null {
    return this._crop ? { ...this._crop } : null;
  }

  getPlantedDay(): number | null {
    return this._plantedDay;
  }

  plant(cropType: CropType, plantedDay: number): void {
    if (this._state !== PlotState.EMPTY) {
      throw new Error(`Cannot plant in plot with state: ${this._state}`);
    }
    if (plantedDay < 1) {
      throw new Error("plantedDay must be >= 1");
    }

    const config = CROP_CONFIG[cropType];
    this._crop = {
      type: cropType,
      plantedDay,
      growthDurationDays: config.growthDurationDays,
      sellValue: config.sellValue,
    };
    this._plantedDay = plantedDay;
    this._state = PlotState.PLANTED;
  }

  harvest(): { cropType: CropType; sellValue: number } {
    if (this._state !== PlotState.READY) {
      throw new Error(
        `Cannot harvest plot in state: ${this._state}. State must be READY.`
      );
    }
    if (!this._crop) {
      throw new Error("No crop to harvest");
    }

    const result = {
      cropType: this._crop.type,
      sellValue: this._crop.sellValue,
    };

    this._crop = null;
    this._plantedDay = null;
    this._state = PlotState.EMPTY;

    return result;
  }

  updateForDay(currentDay: number): void {
    if (!this._crop || !this._plantedDay) {
      return;
    }

    const daysSincePlanting = currentDay - this._plantedDay;

    if (daysSincePlanting >= this._crop.growthDurationDays) {
      this._state = PlotState.READY;
    } else if (daysSincePlanting >= 1) {
      this._state = PlotState.GROWING;
    }
  }

  reset(): void {
    this._state = PlotState.EMPTY;
    this._crop = null;
    this._plantedDay = null;
  }

  toJSON(): PlotJSON {
    return {
      id: this._id,
      state: this._state,
      crop: this._crop,
      plantedDay: this._plantedDay,
    };
  }

  static fromJSON(data: PlotJSON): Plot {
    const plot = new Plot(data.id);
    plot._state = data.state;
    plot._crop = data.crop;
    plot._plantedDay = data.plantedDay;
    return plot;
  }
}