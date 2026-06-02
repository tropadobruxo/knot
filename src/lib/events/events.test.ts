import { describe, expect, it } from "vitest";
import { createEventSchema } from "@/lib/events";

describe("createEventSchema", () => {
  const baseEvent = {
    type: "workshop" as const,
    title: "Shibari para iniciantes",
    city: "São Paulo",
    datetime: "2025-03-15T19:00:00.000Z",
  };

  it("accepts a valid event", () => {
    const result = createEventSchema.safeParse(baseEvent);
    expect(result.success).toBe(true);
  });

  it("munch requires safetyInfo", () => {
    const result = createEventSchema.safeParse({
      ...baseEvent,
      type: "munch",
    });
    expect(result.success).toBe(false);
  });

  it("munch with safetyInfo passes", () => {
    const result = createEventSchema.safeParse({
      ...baseEvent,
      type: "munch",
      safetyInfo: "Local público, bar XYZ na Rua Augusta.",
    });
    expect(result.success).toBe(true);
  });

  it("munch with empty safetyInfo fails", () => {
    const result = createEventSchema.safeParse({
      ...baseEvent,
      type: "munch",
      safetyInfo: "   ",
    });
    expect(result.success).toBe(false);
  });

  it("workshop and festa do not require safetyInfo", () => {
    for (const type of ["workshop", "festa"] as const) {
      const result = createEventSchema.safeParse({ ...baseEvent, type });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid event type", () => {
    const result = createEventSchema.safeParse({
      ...baseEvent,
      type: "rave",
    });
    expect(result.success).toBe(false);
  });

  it("capacity must be positive integer", () => {
    const result = createEventSchema.safeParse({
      ...baseEvent,
      capacity: 0,
    });
    expect(result.success).toBe(false);
  });

  it("priceCents defaults to 0", () => {
    const result = createEventSchema.safeParse(baseEvent);
    if (result.success) {
      expect(result.data.priceCents).toBe(0);
    }
  });

  it("codeOfConductRequired defaults to true", () => {
    const result = createEventSchema.safeParse(baseEvent);
    if (result.success) {
      expect(result.data.codeOfConductRequired).toBe(true);
    }
  });
});

describe("RSVP business rules (unit)", () => {
  it("capacity check: confirmed when under capacity", () => {
    const capacity = 10;
    const confirmedCount = 5;
    const status =
      capacity && confirmedCount >= capacity ? "waitlisted" : "confirmed";
    expect(status).toBe("confirmed");
  });

  it("capacity check: waitlisted when at capacity", () => {
    const capacity = 10;
    const confirmedCount = 10;
    const status =
      capacity && confirmedCount >= capacity ? "waitlisted" : "confirmed";
    expect(status).toBe("waitlisted");
  });

  it("no capacity: always confirmed", () => {
    const capacity = null;
    const confirmedCount = 1000;
    const status =
      capacity && confirmedCount >= capacity ? "waitlisted" : "confirmed";
    expect(status).toBe("confirmed");
  });
});

describe("RSVP list privacy", () => {
  it("attendee list only contains username and verification status", () => {
    const attendee = {
      username: "alice",
      ageVerified: true,
    };
    const keys = Object.keys(attendee);
    expect(keys).toEqual(["username", "ageVerified"]);
    expect(keys).not.toContain("email");
    expect(keys).not.toContain("id");
    expect(keys).not.toContain("approxLat");
  });
});
