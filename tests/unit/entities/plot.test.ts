import { describe, it, expect } from "vitest";
import { Plot } from "../../../src/entities/plot/Plot";
import { PlotState, CropType } from "../../../src/entities/plot/plotTypes";

describe("Plot", () => {
  describe("initialization", () => {
    it("should initialize with EMPTY state", () => {
      const plot = new Plot("plot-1");
      expect(plot.getState()).toBe(PlotState.EMPTY);
      expect(plot.getCrop()).toBeNull();
      expect(plot.getPlantedDay()).toBeNull();
    });

    it("should have correct ID", () => {
      const plot = new Plot("plot-1");
      expect(plot.toJSON().id).toBe("plot-1");
    });
  });

  describe("plant()", () => {
    it("should plant a crop in EMPTY state", () => {
      const plot = new Plot("plot-1");
      plot.plant(CropType.RICE, 1);

      expect(plot.getState()).toBe(PlotState.PLANTED);
      expect(plot.getCrop()).not.toBeNull();
      expect(plot.getCrop()?.type).toBe(CropType.RICE);
      expect(plot.getPlantedDay()).toBe(1);
    });

    it("should throw when planting in PLANTED state", () => {
      const plot = new Plot("plot-1");
      plot.plant(CropType.RICE, 1);

      expect(() => plot.plant(CropType.RICE, 2)).toThrow(
        "Cannot plant in plot with state"
      );
    });

    it("should throw when planting in GROWING state", () => {
      const plot = new Plot("plot-1");
      plot.plant(CropType.RICE, 1);
      plot.updateForDay(2);

      expect(() => plot.plant(CropType.RICE, 2)).toThrow(
        "Cannot plant in plot with state"
      );
    });

    it("should throw when planting in READY state", () => {
      const plot = new Plot("plot-1");
      plot.plant(CropType.RICE, 1);
      plot.updateForDay(4); // day 4, planted day 1, 3 days growth for rice

      expect(() => plot.plant(CropType.RICE, 2)).toThrow(
        "Cannot plant in plot with state"
      );
    });

    it("should throw when plantedDay < 1", () => {
      const plot = new Plot("plot-1");

      expect(() => plot.plant(CropType.RICE, 0)).toThrow(
        "plantedDay must be >= 1"
      );
    });
  });

  describe("updateForDay()", () => {
    it("should transition PLANTED to GROWING after at least 1 day", () => {
      const plot = new Plot("plot-1");
      plot.plant(CropType.RICE, 1);
      expect(plot.getState()).toBe(PlotState.PLANTED);

      plot.updateForDay(2);
      expect(plot.getState()).toBe(PlotState.GROWING);
    });

    it("should transition GROWING to READY after growth duration", () => {
      const plot = new Plot("plot-1");
      plot.plant(CropType.RICE, 1);
      plot.updateForDay(2);
      expect(plot.getState()).toBe(PlotState.GROWING);

      plot.updateForDay(4);
      expect(plot.getState()).toBe(PlotState.READY);
    });

    it("should stay in PLANTED if currentDay equals plantedDay", () => {
      const plot = new Plot("plot-1");
      plot.plant(CropType.RICE, 1);

      plot.updateForDay(1);
      expect(plot.getState()).toBe(PlotState.PLANTED);
    });

    it("should not affect EMPTY plots", () => {
      const plot = new Plot("plot-1");
      plot.updateForDay(100);

      expect(plot.getState()).toBe(PlotState.EMPTY);
    });
  });

  describe("harvest()", () => {
    it("should harvest a READY crop and return crop info", () => {
      const plot = new Plot("plot-1");
      plot.plant(CropType.RICE, 1);
      plot.updateForDay(4);

      const result = plot.harvest();
      expect(result.cropType).toBe(CropType.RICE);
      expect(result.sellValue).toBe(50);
      expect(plot.getState()).toBe(PlotState.EMPTY);
      expect(plot.getCrop()).toBeNull();
    });

    it("should throw when harvesting EMPTY plot", () => {
      const plot = new Plot("plot-1");

      expect(() => plot.harvest()).toThrow("Cannot harvest plot in state");
    });

    it("should throw when harvesting PLANTED crop", () => {
      const plot = new Plot("plot-1");
      plot.plant(CropType.RICE, 1);

      expect(() => plot.harvest()).toThrow("Cannot harvest plot in state");
    });

    it("should throw when harvesting GROWING crop", () => {
      const plot = new Plot("plot-1");
      plot.plant(CropType.RICE, 1);
      plot.updateForDay(2);

      expect(() => plot.harvest()).toThrow("Cannot harvest plot in state");
    });
  });

  describe("reset()", () => {
    it("should reset plot to EMPTY state", () => {
      const plot = new Plot("plot-1");
      plot.plant(CropType.RICE, 1);
      plot.updateForDay(2);

      plot.reset();

      expect(plot.getState()).toBe(PlotState.EMPTY);
      expect(plot.getCrop()).toBeNull();
      expect(plot.getPlantedDay()).toBeNull();
    });
  });

  describe("toJSON() and fromJSON()", () => {
    it("should serialize and deserialize plot correctly", () => {
      const plot = new Plot("plot-1");
      plot.plant(CropType.RICE, 1);
      plot.updateForDay(2);

      const json = plot.toJSON();
      const restored = Plot.fromJSON(json);

      expect(restored.getState()).toBe(plot.getState());
      expect(restored.getCrop()?.type).toBe(plot.getCrop()?.type);
      expect(restored.getPlantedDay()).toBe(plot.getPlantedDay());
    });
  });

  describe("complete plant-grow-harvest cycle", () => {
    it("should complete full cycle for rice", () => {
      const plot = new Plot("plot-1");

      // Plant
      plot.plant(CropType.RICE, 1);
      expect(plot.getState()).toBe(PlotState.PLANTED);

      // Sleep 1 day
      plot.updateForDay(2);
      expect(plot.getState()).toBe(PlotState.GROWING);

      // Sleep 2 more days (total 3)
      plot.updateForDay(3);
      expect(plot.getState()).toBe(PlotState.GROWING);

      // Sleep 1 more day (total 4, crop should be ready)
      plot.updateForDay(4);
      expect(plot.getState()).toBe(PlotState.READY);

      // Harvest
      const result = plot.harvest();
      expect(result.cropType).toBe(CropType.RICE);
      expect(result.sellValue).toBe(50);
      expect(plot.getState()).toBe(PlotState.EMPTY);

      // Can plant again
      plot.plant(CropType.RICE, 4);
      expect(plot.getState()).toBe(PlotState.PLANTED);
    });
  });
});