export type WithID<Type, IdType = string> = Type & { id: IdType }
export type WithLodashID<Type, IdType = string> = Type & { _id: IdType }
