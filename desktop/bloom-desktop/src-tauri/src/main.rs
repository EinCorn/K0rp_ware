#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
fn begin_window_move(window: tauri::Window) -> Result<(), String> {
    window.start_dragging().map_err(|error| error.to_string())
}

#[tauri::command]
fn set_always_on_top(window: tauri::Window, enabled: bool) -> Result<bool, String> {
    window
        .set_always_on_top(enabled)
        .map_err(|error| error.to_string())?;

    Ok(enabled)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![begin_window_move, set_always_on_top])
        .run(tauri::generate_context!())
        .expect("error while running K0rp Bloom");
}
