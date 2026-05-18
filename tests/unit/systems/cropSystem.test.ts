import { describe, it, expect, vi, beforeEach } from "vitest";
import * as cropSystem from "../../../src/systems/cropSystem";
import * as gameState from "../../../src/state/gameState";
import { CropType } from "../../../src/entities/plot/plotTypes";

vi.mock("../../../src/state/gameState", () => ({
  getCurrentDay: vi.fn(() => 1),
  getPlotState: vi.fn(() => ({
    id: "main-plot",
    state: "empty",
    crop: null,
    plantedDay: null,
  })),
  addMoney: vi.fn(),
  setState: vi.fn(),
}));

describe("cropSystem", () => {
  beforeEach(() => {
    cropSystem.resetCropSystem();
    vi.clearAllMocks();
    vi.mocked(gameState.getCurrentDay).mockReturnValue(1);
  });

  describe("plotCrop", () => {
    it("should plant a crop in the plot", () => {
      cropSystem.plotCrop(CropType.RICE);

      const plot = cropSystem.getPlot();
      expect(plot.getState()).toBe("planted");
      expect(plot.getCrop()).not.toBeNull();
      expect(plot.getCrop()?.type).toBe(CropType.RICE);
    });

    it("should sync plot state to gameState after planting", () => {
      cropSystem.plotCrop(CropType.RICE);

      expect(gameState.setState).toHaveBeenCalledWith(
        expect.objectContaining({
          plot: expect.objectContaining({
            state: "planted",
          }),
        })
      );
    });

    it("should throw when plot is not empty", () => {
      cropSystem.plotCrop(CropType.RICE);

      expect(() => cropSystem.plotCrop(CropType.RICE)).toThrow(
        "Cannot plant in plot with state"
      );
    });
  });

  describe("harvestCrop", () => {
    it("should harvest a ready crop and add money", () => {
      vi.mocked(gameState.getCurrentDay).mockReturnValue(1);
      cropSystem.plotCrop(CropType.RICE);

      vi.mocked(gameState.getCurrentDay).mockReturnValue(4);
      cropSystem.advanceCropGrowth();

      const result = cropSystem.harvestCrop();

      expect(result.cropType).toBe(CropType.RICE);
      expect(result.sellValue).toBe(50);
      expect(gameState.addMoney).toHaveBeenCalledWith(50);
    });

    it("should throw when plot is empty", () => {
      expect(() => cropSystem.harvestCrop()).toThrow(
        "Cannot harvest plot in state"
      );
    });

    it("should throw when crop is not ready", () => {
      vi.mocked(gameState.getCurrentDay).mockReturnValue(1);
      cropSystem.plotCrop(CropType.RICE);

      expect(() => cropSystem.harvestCrop()).toThrow(
        "Cannot harvest plot in state"
      );
    });
  });

  describe("advanceCropGrowth", () => {
    it("should update crop growth based on current day", () => {
      vi.mocked(gameState.getCurrentDay).mockReturnValue(1);
      cropSystem.plotCrop(CropType.RICE);

      expect(cropSystem.getPlot().getState()).toBe("planted");

      vi.mocked(gameState.getCurrentDay).mockReturnValue(2);
      cropSystem.advanceCropGrowth();
      expect(cropSystem.getPlot().getState()).toBe("growing");

      vi.mocked(gameState.getCurrentDay).mockReturnValue(4);
      cropSystem.advanceCropGrowth();
      expect(cropSystem.getPlot().getState()).toBe("ready");
    });

    it("should not affect empty plots", () => {
      cropSystem.advanceCropGrowth();
      expect(cropSystem.getPlot().getState()).toBe("empty");
    });
  });

  describe("resetCropSystem", () => {
    it("should reset the plot to empty state", () => {
      cropSystem.plotCrop(CropType.RICE);
      expect(cropSystem.getPlot().getState()).toBe("planted");

      cropSystem.resetCropSystem();

      expect(cropSystem.getPlot().getState()).toBe("empty");
      expect(cropSystem.getPlot().getCrop()).toBeNull();
    });
  });

  describe("complete lifecycle", () => {
    it("should handle complete plant-grow-harvest cycle", () => {
      vi.mocked(gameState.getCurrentDay).mockReturnValue(1);
      cropSystem.plotCrop(CropType.RICE);
      expect(cropSystem.getPlot().getState()).toBe("planted");

      vi.mocked(gameState.getCurrentDay).mockReturnValue(2);
      cropSystem.advanceCropGrowth();
      expect(cropSystem.getPlot().getState()).toBe("growing");

      vi.mocked(gameState.getCurrentDay).mockReturnValue(3);
      cropSystem.advanceCropGrowth();
      expect(cropSystem.getPlot().getState()).toBe("growing");

      vi.mocked(gameState.getCurrentDay).mockReturnValue(4);
      cropSystem.advanceCropGrowth();
      expect(cropSystem.getPlot().getState()).toBe("ready");

      const result = cropSystem.harvestCrop();
      expect(result.cropType).toBe(CropType.RICE);
      expect(result.sellValue).toBe(50);
      expect(cropSystem.getPlot().getState()).toBe("empty");
      expect(gameState.addMoney).toHaveBeenCalledWith(50);

      cropSystem.plotCrop(CropType.RICE);
      expect(cropSystem.getPlot().getState()).toBe("planted");
    });
  });
});
