export const governedSurfaceCopy = {
  "GovernedSurface.forbiddenTitle": "You do not have access to this surface",
  "GovernedSurface.forbiddenDescription":
    "Your organization role does not include permission to view this data.",
  "GovernedSurface.invalidConfigTitle": "This surface could not be rendered",
  "GovernedSurface.invalidConfigDescription":
    "The server metadata contract failed validation. Operators can inspect logs for details.",
} as const;

type GovernedSurfaceCopyKey = keyof typeof governedSurfaceCopy;

export async function getGovernedSurfaceTranslations(_namespace?: string) {
  return (key: GovernedSurfaceCopyKey) => governedSurfaceCopy[key];
}
