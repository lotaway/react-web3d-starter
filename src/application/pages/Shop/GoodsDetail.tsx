import {useParams, useLoaderData} from "react-router-dom"

type Props = {}

export default function GoodsDetail(props: Props) {
    const {id} = useParams()
    const preData = useLoaderData() as {
        status: number
        data: {
            pictures: Array<{
                bigImg: string
            }>
            goodsName: string
            goodsRemark: string
        }
    }
    const result = {
        data: {
            pictures: [{
                bigImg: ""
            }],
            goodsName: "fake",
            goodsRemark: "<p>something</p>"
        }
    };
    return (
        <div className="goods-detail">
            <div className="simple">
                <img className="thumbnail" src={result.data.pictures[0].bigImg} alt={result.data.goodsName}/>
                <h1>{result.data.goodsName}</h1>
                <p>Goods Detail with id : {id}</p>
            </div>
            <div className="detail" dangerouslySetInnerHTML={{__html: result.data.goodsRemark}}/>
        </div>
    )
}
