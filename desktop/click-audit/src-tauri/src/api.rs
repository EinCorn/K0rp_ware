use crate::state::{CounterSnapshot, CounterState};
use std::thread;
use tauri::{AppHandle, Emitter, Manager};
use tiny_http::{Header, Method, Response, Server};

const API_ADDR: &str = "127.0.0.1:47891";

pub fn start_local_api(state: CounterState, app_handle: AppHandle) {
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
                let snapshot = state.snapshot();
                let _ = request.respond(json_response(&snapshot));
                continue;
            }

            if method == Method::Get && path == "/health" {
                let response = Response::from_string("ok").with_status_code(200);
                let _ = request.respond(with_cors(response));
                continue;
            }

            if method == Method::Post && path == "/start" {
                let snapshot = state.start();
                emit_update(&app_handle, &snapshot);
                let _ = request.respond(json_response(&snapshot));
                continue;
            }

            if method == Method::Post && path == "/pause" {
                let snapshot = state.pause();
                emit_update(&app_handle, &snapshot);
                let _ = request.respond(json_response(&snapshot));
                continue;
            }

            if method == Method::Post && path == "/reset" {
                let snapshot = state.reset();
                emit_update(&app_handle, &snapshot);
                let _ = request.respond(json_response(&snapshot));
                continue;
            }

            if method == Method::Post && path.starts_with("/always-on-top") {
                let enabled = path.contains("enabled=true");

                if let Some(window) = app_handle.get_webview_window("main") {
                    let _ = window.set_always_on_top(enabled);
                }

                let snapshot = state.set_always_on_top(enabled);
                emit_update(&app_handle, &snapshot);
                let _ = request.respond(json_response(&snapshot));
                continue;
            }

            let response = Response::from_string("not found").with_status_code(404);
            let _ = request.respond(with_cors(response));
        }
    });
}

fn emit_update(app_handle: &AppHandle, snapshot: &CounterSnapshot) {
    let _ = app_handle.emit("click-audit:update", snapshot);
}

fn json_response(snapshot: &CounterSnapshot) -> Response<std::io::Cursor<Vec<u8>>> {
    let body = serde_json::to_vec(snapshot).unwrap_or_else(|_| b"{}".to_vec());
    with_cors(Response::from_data(body).with_header(json_header()).with_status_code(200))
}

fn json_header() -> Header {
    Header::from_bytes(&b"Content-Type"[..], &b"application/json"[..]).unwrap()
}

fn with_cors<R: std::io::Read + Send + 'static>(response: Response<R>) -> Response<R> {
    response
        .with_header(Header::from_bytes(&b"Access-Control-Allow-Origin"[..], &b"*"[..]).unwrap())
        .with_header(Header::from_bytes(&b"Access-Control-Allow-Methods"[..], &b"GET, POST, OPTIONS"[..]).unwrap())
        .with_header(Header::from_bytes(&b"Access-Control-Allow-Headers"[..], &b"Content-Type"[..]).unwrap())
        .with_header(Header::from_bytes(&b"Access-Control-Allow-Private-Network"[..], &b"true"[..]).unwrap())
}
