import { describe, expect, test, setSystemTime, afterEach } from "bun:test";
import { getCurrentSlot } from "./timeSlotManager";

describe("timeSlotManager", () => {
  describe("getCurrentSlot", () => {
    // Reset the system time after each test to avoid side effects
    afterEach(() => {
      setSystemTime();
    });

    test("returns null during rest period (05:00 - 07:59)", () => {
      setSystemTime(new Date("2023-01-01T05:00:00"));
      expect(getCurrentSlot()).toBeNull();

      setSystemTime(new Date("2023-01-01T06:30:00"));
      expect(getCurrentSlot()).toBeNull();

      setSystemTime(new Date("2023-01-01T07:59:59"));
      expect(getCurrentSlot()).toBeNull();
    });

    test("returns 'morning' during morning slot (08:00 - 12:59)", () => {
      setSystemTime(new Date("2023-01-01T08:00:00"));
      expect(getCurrentSlot()).toBe("morning");

      setSystemTime(new Date("2023-01-01T10:15:00"));
      expect(getCurrentSlot()).toBe("morning");

      setSystemTime(new Date("2023-01-01T12:59:59"));
      expect(getCurrentSlot()).toBe("morning");
    });

    test("returns 'noon' during noon slot (13:00 - 17:59)", () => {
      setSystemTime(new Date("2023-01-01T13:00:00"));
      expect(getCurrentSlot()).toBe("noon");

      setSystemTime(new Date("2023-01-01T15:45:00"));
      expect(getCurrentSlot()).toBe("noon");

      setSystemTime(new Date("2023-01-01T17:59:59"));
      expect(getCurrentSlot()).toBe("noon");
    });

    test("returns 'night' during evening/night slot (18:00 - 04:59)", () => {
      setSystemTime(new Date("2023-01-01T18:00:00"));
      expect(getCurrentSlot()).toBe("night");

      setSystemTime(new Date("2023-01-01T23:59:59"));
      expect(getCurrentSlot()).toBe("night");

      setSystemTime(new Date("2023-01-02T00:00:00"));
      expect(getCurrentSlot()).toBe("night");

      setSystemTime(new Date("2023-01-02T02:30:00"));
      expect(getCurrentSlot()).toBe("night");

      setSystemTime(new Date("2023-01-02T04:59:59"));
      expect(getCurrentSlot()).toBe("night");
    });
  });
});
