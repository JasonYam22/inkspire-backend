// types/tattoo.types.ts
export interface UpdateTattooIdeaBody {
  title?: string;
  genre?: string;
  spot?: string;
  artist?: string;
  social?: string;
  notes?: string;
  isFavorite?: string | boolean;
}