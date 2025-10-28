interface IProcessor {
    preHandler?: <Params extends HttpRequestOptions<unknown> = HttpRequestOptions<unknown>, Result extends Params = Params>(params: Params) => Result
    afterHandler?: <Params, Result extends Params = Params>(params: Params) => Result
}