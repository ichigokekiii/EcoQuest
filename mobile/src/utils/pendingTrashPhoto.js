let pendingTrashPhoto = null;

export function setPendingTrashPhoto(photoAsset) {
  pendingTrashPhoto = photoAsset;
}

export function getPendingTrashPhoto() {
  return pendingTrashPhoto;
}

export function clearPendingTrashPhoto() {
  pendingTrashPhoto = null;
}
