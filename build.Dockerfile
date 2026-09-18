FROM rust:latest AS build

ENV CROSS_CONTAINER_IN_CONTAINER=true

RUN cargo install cross --git https://github.com/cross-rs/cross
RUN rustup target add aarch64-unknown-linux-gnu

RUN mkdir -p /app
WORKDIR /app

COPY . .

RUN cross build --manifest-path=csml_server/Cargo.toml --features csml_engine/postgresql --target aarch64-unknown-linux-gnu --release

FROM scratch
COPY --from=build /app/target/release/csml_server /
