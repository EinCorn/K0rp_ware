use crate::state::CounterState;
use tauri::{AppHandle, Emitter};

#[cfg(target_os = "macos")]
mod platform {
    use super::*;
    use core_foundation::runloop::CFRunLoop;
    use core_graphics::event::{
        CallbackResult, CGEventTap, CGEventTapLocation, CGEventTapOptions, CGEventTapPlacement,
        CGEventType,
    };
    use std::thread;

    pub fn start(state: CounterState, app_handle: AppHandle) {
        thread::spawn(move || {
            let update_handle = app_handle.clone();

            let result = CGEventTap::with_enabled(
                CGEventTapLocation::HID,
                CGEventTapPlacement::HeadInsertEventTap,
                CGEventTapOptions::Default,
                vec![
                    CGEventType::LeftMouseDown,
                    CGEventType::RightMouseDown,
                    CGEventType::OtherMouseDown,
                ],
                move |_proxy, event_type, _event| {
                    if matches!(
                        event_type,
                        CGEventType::LeftMouseDown
                            | CGEventType::RightMouseDown
                            | CGEventType::OtherMouseDown
                    ) {
                        if let Some(snapshot) = state.add_one() {
                            let _ = update_handle.emit("click-audit:update", snapshot);
                        }
                    }

                    CallbackResult::Keep
                },
                CFRunLoop::run_current,
            );

            if result.is_err() {
                let _ = app_handle.emit(
                    "click-audit:notice",
                    "macOS mouse event tap could not start. Check Accessibility/Input Monitoring permissions.",
                );
            }
        });
    }
}

#[cfg(not(target_os = "macos"))]
mod platform {
    use super::*;
    use rdev::{listen, Event, EventType};
    use std::thread;

    pub fn start(state: CounterState, app_handle: AppHandle) {
        thread::spawn(move || {
            let update_handle = app_handle.clone();

            let callback = move |event: Event| {
                if matches!(event.event_type, EventType::ButtonPress(_)) {
                    if let Some(snapshot) = state.add_one() {
                        let _ = update_handle.emit("click-audit:update", snapshot);
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
}

pub fn start_counter(state: CounterState, app_handle: AppHandle) {
    platform::start(state, app_handle);
}
