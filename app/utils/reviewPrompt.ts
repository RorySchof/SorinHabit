import * as StoreReview from 'expo-store-review';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function maybeAskForReview() {
  const hasAction = await StoreReview.hasAction();
  if (!hasAction) return;

  const alreadyAsked = await AsyncStorage.getItem('hasAskedForReview');
  if (alreadyAsked) return;

  StoreReview.requestReview();
  await AsyncStorage.setItem('hasAskedForReview', 'true');
}
