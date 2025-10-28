import Decimal from "./Decimal"
import { StoreSize } from "./StoreSize"
import * as Str from "./Str"
import { BlockTime, Days, Hours, Milliseconds, Minutes, Seconds, Time } from "./Time"
import * as Types from "./types"

namespace std {
   export const string = Str
   export const decimal = Decimal.new
   export const time = Time.new
   export const days = Days.new
   export const hours = Hours.new
   export const minutes = Minutes.new
   export const seconds = Seconds.new
   export const milliseconds = Milliseconds.new
   export const blockTime = BlockTime.new
   export const storeSize = StoreSize.new
   export const types = Types
}

export default std