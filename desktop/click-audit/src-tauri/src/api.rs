use crate::state::CounterState;
use std::thread;
use tiny_http::{Header, Method, Response, Server};

const API_ADDR: &str = "127.0.0.1:47891";

pub fn start_local_api(state: CounterState) {
    thread::spawn(move || {
        let Ok(server) = Server::http(API_ADDR) else {
            return;
        };

        for request in server.incoming_requests() {
            let method = request.method().clone();
            let path = request.url().to_string();

            if method == Method::Options {
                let _ = request.respond(with_cors(Response::empty(204)));
                continue;
            }

            if method == Method::Get && path == "/state" {
                let body = serde_json::to_string(&state.snapshot()).unwrap_or_else(|_| "{}".to_string());
                let response = Response::from_string(body)
                    .with_header(json_header())
                    .with_status_code(200);
                let _ = request.respond(with_cors(response));
                continue;
            }

            if method == Method::Get && path == "/health" {
                let response = Response::from_string("ok").with_status_code(200);
                let _ = request.respond(with_cors(response));
                continue;
            }

            let response = Response::from_string("not found").with_status_code(404);
            let _ = request.respond(with_cors(response));
        }
    });
}

fn json_header() -> Header {
    Header::from_bytes(&b"Content-Type"[..], &b"application/json"[..]).unwrap()
}

fn with_cors<R: std::io::Read + Send + 'static>(response: Response<R>) -> Response<R> {
    response
        .with_header(Header::from_bytes(&b"Access-Control-Allow-Origin"[..], &b"*"[..]).unwrap())
        .with_header(Header::from_bytes(&b"Access-Control-Allow-Methods"[..], &b"GET, OPTIONS"[..]).unwrap())
        .with_header(Header::from_bytes(&b"Access-Control-Allow-Headers"[..], &b"Content-Type"[..]).unwrap())
}
