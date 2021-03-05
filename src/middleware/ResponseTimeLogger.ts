import Application from "koa";

export const responseTimeLogger = async (ctx: Application.ExtendableContext & { state: Application.DefaultState } & Application.DefaultContext & { body: any; response: { body: any } }, next: () => Promise<any>) => {
    const start: number = Date.now();
    await next();
    const ms: number = Date.now() - start;
    ctx.set("X-Response-Time", `${ms}ms`);
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
}