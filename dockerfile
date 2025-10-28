# 打包项目
FROM node:latest AS build
RUN npm install
RUN npm run build

# 使用web服务器运行项目
FROM nginx:1.18.0
COPY --from=build ./dist /usr/share/nginx/html
EXPOSE 30001
CMD ["nginx", "-g", "daemon off;"]