FROM denoland/deno:1.11.2

WORKDIR /app

COPY apiserver/deps.ts apiserver/deps.ts
RUN deno cache apiserver/deps.ts

COPY . .
RUN deno cache apiserver/apiserver.ts

EXPOSE 8880
CMD ["run", "-A", "apiserver/apiserver.ts"]
