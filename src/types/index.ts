export type Profile = {
  id: string
  username: string
  created_at: string
}

export type CoordRecord = {
  id: string
  user_id: string
  photo_url: string
  comment: string | null
  worn_at: string
  created_at: string
}
