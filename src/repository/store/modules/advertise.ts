import {createSlice, createAsyncThunk} from "@reduxjs/toolkit"
import NSAdvertisement from "../../services/advertisement"
import System from "../../../system/System"
import {AdvertiseStates} from "./IAdvertiseStates"

const initialState: AdvertiseStates = {

    },
    serviceAdvertise = new NSAdvertisement.Service(System.getInstance()),
    name = "advertise",
    advertiseSlice = createSlice({
        name,
        initialState,
        reducers: {
            setHomeBanner(state: AdvertiseStates, {payload}) {
                return serviceAdvertise.getAppHomeBanner()
            },
            setCategoryAd(state: AdvertiseStates, {payload}) {
                return serviceAdvertise.getCategoryAd({
                    categoryIdentity: 0,
                    location: "category",
                    pageName: "home"
                })
            }
        },
        extraReducers: (builder) => {
            builder
                .addCase(getHomeBanner.fulfilled.type, (state, action) => {

                })
        }
    })
export const getHomeBanner = createAsyncThunk<unknown, {
    pageIndex?: number
} | undefined>(
    `${name}/getHomeBanner`,
    async () => {
        return await serviceAdvertise.getAppHomeBanner()
    })
export default advertiseSlice.reducer
