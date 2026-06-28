mod api;
mod click_hook;
mod state;

use state::{CounterSnapshot, CounterState};
use tauri::State;

#[tauri::command]
fn get_state(state: State<'_, CounterState>) -> CounterSnapshot {
    state.snapshot()
}

#[tauri::command]
fn start_counting(state: State<'_, CounterState>) -> CounterSnapshot {
    state.start()
}

#[tauri::command]
fn pause_counting(state: State<'_, CounterState>) -> CounterSnapshot {
    state.pause()
}

#[tauri::command]
fn reset_counting(state: State<'_, CounterState>) -> CounterSnapshot {
    state.reset()
}

#[tauri::command]
fn set_count_for_dev(state: State<'_, CounterState>, count: u64) -> CounterSnapshot {
    state.set_count_for_dev(count)
}

#[tauri::command]
fn set_always_on_top(
    window: tauri::Window,
    state: State<'_, CounterState>,
    enabled: bool,
) -> Result<CounterSnapshot, String> {
    window
        .set_always_on_top(enabled)
        .map_err(|error| error.to_string())?;

    Ok(state.set_always_on_top(enabled))
}

fn main() {
    let state = CounterState::new();

    tauri::Builder::default()
        .manage(state.clone())
        .setup(move |app| {
            let app_handle = app.handle().clone();
            api::start_local_api(state.clone(), app_handle.clone());
            click_hook::start_counter(state.clone(), app_handle);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_state,
            start_counting,
            pause_counting,
            reset_counting,
            set_count_for_dev,
            set_always_on_top
        ])
        .run(tauri::generate_context!())
        .expect("error while running K0rp ClickAudit");
}
