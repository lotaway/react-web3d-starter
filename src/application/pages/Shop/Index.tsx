import {Link} from "react-router-dom"
import {create} from "zustand/react";
import React from "react"

interface Goods {
    id: number
    name: string
}

interface GoodsState {
    goods: Goods[]
    updateGoods: () => void
}

const useGoodsStore = create<GoodsState>((set) => ({
    goods: [],
    updateGoods: () => set((state) => ({ goods: [{
            id: 462,
            name: "Test goods"
        }] })),
}))



export default function Index() {
    const {goods, updateGoods} = useGoodsStore()
    return (
        <div className="shop-index">
            <h1 className="main-color">Shop</h1>
            {
                goods.map((item: { id: any; name: any; }) => (
                    <Link to={`/shop/goods/${item.id}`} key={item.id}>{item.name}</Link>
                ))
            }
            <button onClick={updateGoods}>Update goods</button>
        </div>
    )
}