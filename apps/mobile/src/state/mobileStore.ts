export interface MobileUIState {
  reconnecting: boolean;
  lastError?: string;
}

export const initialMobileUIState: MobileUIState = {
  reconnecting: false,
};
