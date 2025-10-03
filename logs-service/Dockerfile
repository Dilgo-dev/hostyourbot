FROM golang:1.22-alpine AS base

WORKDIR /app

RUN apk add --no-cache gcc musl-dev sqlite-dev

COPY go.mod go.sum ./

FROM base AS development

RUN go mod download

COPY . .

EXPOSE 3002

CMD ["go", "run", "cmd/server/main.go"]

FROM base AS builder

RUN go mod download

COPY . .

RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o main cmd/server/main.go

FROM alpine:latest AS production

RUN apk --no-cache add ca-certificates sqlite-libs

WORKDIR /root/

COPY --from=builder /app/main .

RUN mkdir -p /root/data

EXPOSE 3002

CMD ["./main"]
