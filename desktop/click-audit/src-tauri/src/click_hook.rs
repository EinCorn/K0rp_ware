use crate::state::CounterState;
use rdev::{listen, Event, EventType};
use std::thread;
use tauri::{AppHandle, Emitter};

pub fn start_counter(state: CounterState, app_handle: AppHandle) {
    thread::spawn(move || {
        let callback = move |event: Event| {
            if matches!(event.event_type, EventType::ButtonPress(_)) {
                if let Some(snapshot) = state.add_one() {
                    let _ = app_handle.emit("click-audit:update", snapshot);
                }
            }
        };

        if listen(callback).is_err() {
            let _ = app_handle.emit(
                "click-audit:notice",
                "Input counting could not start on this system.",
            );
        }
    });
}
