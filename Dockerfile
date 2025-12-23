# Base image를 ARM64로 명시
FROM --platform=linux/arm64 node:20-alpine

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 설치
COPY package*.json ./
RUN npm install --frozen-lockfile --loglevel=error

# 앱 코드 복사
COPY . .

# ✅ [ADD] GitHub Actions build-arg를 Dockerfile에서 받기
ARG NEXT_PUBLIC_GOOGLE_LOGIN_PATH
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_GTM_ID

# ✅ [ADD] next build가 process.env로 읽을 수 있게 환경변수로 노출
ENV NEXT_PUBLIC_GOOGLE_LOGIN_PATH=$NEXT_PUBLIC_GOOGLE_LOGIN_PATH
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_GTM_ID=$NEXT_PUBLIC_GTM_ID

# Next.js 빌드
RUN npm run build

# 포트 설정
EXPOSE 3000

# 앱 실행
CMD ["npm", "start"]
