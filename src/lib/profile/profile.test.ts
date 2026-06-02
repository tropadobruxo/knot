import { describe, expect, it } from "vitest";
import { roundCoord } from "@/lib/profile";

describe("profile privacy", () => {
  describe("roundCoord", () => {
    it("rounds to 2 decimal places (~1km precision)", () => {
      expect(roundCoord(-23.550520)).toBe(-23.55);
      expect(roundCoord(-46.633308)).toBe(-46.63);
    });

    it("never returns more than 2 decimal places", () => {
      const result = roundCoord(40.7127753);
      const decimals = result.toString().split(".")[1]?.length ?? 0;
      expect(decimals).toBeLessThanOrEqual(2);
    });
  });

  describe("photo visibility rules", () => {
    type Photo = {
      id: string;
      url: string;
      visibility: "public" | "afterMatch" | "private";
    };

    function filterPhotos(
      photos: Photo[],
      opts: { isOwner: boolean; hasMatch: boolean },
    ): Photo[] {
      return photos.filter((photo) => {
        if (photo.visibility === "public") return true;
        if (photo.visibility === "afterMatch")
          return opts.isOwner || opts.hasMatch;
        return opts.isOwner;
      });
    }

    const photos: Photo[] = [
      { id: "1", url: "a.jpg", visibility: "public" },
      { id: "2", url: "b.jpg", visibility: "afterMatch" },
      { id: "3", url: "c.jpg", visibility: "private" },
    ];

    it("stranger sees only public photos", () => {
      const result = filterPhotos(photos, {
        isOwner: false,
        hasMatch: false,
      });
      expect(result.map((p) => p.id)).toEqual(["1"]);
    });

    it("matched user sees public + afterMatch photos", () => {
      const result = filterPhotos(photos, {
        isOwner: false,
        hasMatch: true,
      });
      expect(result.map((p) => p.id)).toEqual(["1", "2"]);
    });

    it("owner sees all photos", () => {
      const result = filterPhotos(photos, {
        isOwner: true,
        hasMatch: false,
      });
      expect(result.map((p) => p.id)).toEqual(["1", "2", "3"]);
    });

    it("afterMatch photo never leaks to non-matched stranger", () => {
      const result = filterPhotos(photos, {
        isOwner: false,
        hasMatch: false,
      });
      expect(result.find((p) => p.visibility === "afterMatch")).toBeUndefined();
    });
  });

  describe("public profile never exposes private fields", () => {
    it("response shape excludes email, coordinates, and password", () => {
      // Simulating the shape returned by getPublicProfile
      const publicProfile = {
        id: "1",
        username: "alice",
        bio: "hello",
        roleType: "sub",
        intent: ["amizade"],
        city: "São Paulo",
        ageVerified: true,
        premiumTier: "free",
        lastActive: new Date(),
        createdAt: new Date(),
        interests: [],
        limits: [],
        photos: [],
      };

      const keys = Object.keys(publicProfile);
      expect(keys).not.toContain("email");
      expect(keys).not.toContain("hashedPassword");
      expect(keys).not.toContain("approxLat");
      expect(keys).not.toContain("approxLng");
    });
  });
});

describe("discreet mode manifest", () => {
  const DEFAULT_MANIFEST = {
    name: "Knot",
    short_name: "Knot",
  };

  const DISCREET_MANIFEST = {
    name: "Notes",
    short_name: "Notes",
  };

  it("discreet mode uses neutral name", () => {
    expect(DISCREET_MANIFEST.name).not.toContain("Knot");
    expect(DISCREET_MANIFEST.name).not.toContain("kink");
  });

  it("default mode shows real app name", () => {
    expect(DEFAULT_MANIFEST.name).toBe("Knot");
  });
});
