export type AlertLike = {
  id: string;
  latitude?: number;
  longitude?: number;
  location?: string;
  created_at?: string;
  status?: string;
  [k: string]: any;
};

export type LgaProps = {
  state?: string;
  alerts?: AlertLike[];
  selectedLga?: string;
};
