use directories::ProjectDirs;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};

const SAVE_EVERY_CLICKS: u64 = 10;

#[derive(Clone)]
pub struct CounterState {
    inner: Arc<CounterStateInner>,
}

struct CounterStateInner {
    count: AtomicU64,
    click_audit_clicks: AtomicU64,
    fidget_clicks: AtomicU64,
    bloom_clicks: AtomicU64,
    always_on_top: AtomicBool,
    started_at_unix_ms: AtomicU64,
    store_path: PathBuf,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CounterSnapshot {
    pub app: &'static str,
    pub running: bool,
    pub global_clicks: u64,
    pub source_clicks: SourceClickSnapshot,
    pub started_at_unix_ms: Option<u64>,
    pub always_on_top: bool,
    pub privacy_mode: &'static str,
}

#[derive(Clone, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SourceClickSnapshot {
    pub click_audit: u64,
    pub fidget: u64,
    pub bloom: u64,
    pub work_question: u64,
}

#[derive(Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct StoredCounterState {
    global_clicks: u64,
    started_at_unix_ms: u64,
    source_clicks: StoredSourceClicks,
}

#[derive(Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct StoredSourceClicks {
    click_audit: u64,
    fidget: u64,
    bloom: u64,
}

impl CounterState {
    pub fn new() -> Self {
        let store_path = get_store_path();
        let stored_state = read_stored_state(&store_path);
        let started_at = if stored_state.started_at_unix_ms == 0 {
            current_unix_ms()
        } else {
            stored_state.started_at_unix_ms
        };

        Self {
            inner: Arc::new(CounterStateInner {
                count: AtomicU64::new(stored_state.global_clicks),
                click_audit_clicks: AtomicU64::new(stored_state.source_clicks.click_audit),
                fidget_clicks: AtomicU64::new(stored_state.source_clicks.fidget),
                bloom_clicks: AtomicU64::new(stored_state.source_clicks.bloom),
                always_on_top: AtomicBool::new(false),
                started_at_unix_ms: AtomicU64::new(started_at),
                store_path,
            }),
        }
    }

    pub fn snapshot(&self) -> CounterSnapshot {
        let global_clicks = self.inner.count.load(Ordering::Relaxed);
        let click_audit = self.inner.click_audit_clicks.load(Ordering::Relaxed);
        let fidget = self.inner.fidget_clicks.load(Ordering::Relaxed);
        let bloom = self.inner.bloom_clicks.load(Ordering::Relaxed);
        let known_k0rp_clicks = click_audit.saturating_add(fidget).saturating_add(bloom);
        let started_at_unix_ms = match self.inner.started_at_unix_ms.load(Ordering::Relaxed) {
            0 => None,
            value => Some(value),
        };

        CounterSnapshot {
            app: "click-audit",
            running: true,
            global_clicks,
            source_clicks: SourceClickSnapshot {
                click_audit,
                fidget,
                bloom,
                work_question: global_clicks.saturating_sub(known_k0rp_clicks),
            },
            started_at_unix_ms,
            always_on_top: self.inner.always_on_top.load(Ordering::Relaxed),
            privacy_mode: "aggregate-and-local-app-source",
        }
    }

    pub fn start(&self) -> CounterSnapshot {
        self.snapshot()
    }

    pub fn pause(&self) -> CounterSnapshot {
        self.snapshot()
    }

    pub fn reset(&self) -> CounterSnapshot {
        self.inner.count.store(0, Ordering::Relaxed);
        self.inner.click_audit_clicks.store(0, Ordering::Relaxed);
        self.inner.fidget_clicks.store(0, Ordering::Relaxed);
        self.inner.bloom_clicks.store(0, Ordering::Relaxed);
        self.inner
            .started_at_unix_ms
            .store(current_unix_ms(), Ordering::Relaxed);
        self.persist();
        self.snapshot()
    }

    pub fn set_count_for_dev(&self, count: u64) -> CounterSnapshot {
        self.inner.count.store(count, Ordering::Relaxed);
        self.persist();
        self.snapshot()
    }

    pub fn set_always_on_top(&self, enabled: bool) -> CounterSnapshot {
        self.inner.always_on_top.store(enabled, Ordering::Relaxed);
        self.snapshot()
    }

    pub fn report_app_click(&self, source: &str) -> CounterSnapshot {
        match source {
            "click-audit" | "clickAudit" => {
                self.inner.click_audit_clicks.fetch_add(1, Ordering::Relaxed);
            }
            "fidget" => {
                self.inner.fidget_clicks.fetch_add(1, Ordering::Relaxed);
            }
            "bloom" => {
                self.inner.bloom_clicks.fetch_add(1, Ordering::Relaxed);
            }
            _ => {}
        }

        self.persist();
        self.snapshot()
    }

    pub fn add_one(&self) -> Option<CounterSnapshot> {
        let next_count = self.inner.count.fetch_add(1, Ordering::Relaxed) + 1;

        if next_count % SAVE_EVERY_CLICKS == 0 {
            self.persist();
        }

        Some(self.snapshot())
    }

    fn persist(&self) {
        let stored_state = StoredCounterState {
            global_clicks: self.inner.count.load(Ordering::Relaxed),
            started_at_unix_ms: self.inner.started_at_unix_ms.load(Ordering::Relaxed),
            source_clicks: StoredSourceClicks {
                click_audit: self.inner.click_audit_clicks.load(Ordering::Relaxed),
                fidget: self.inner.fidget_clicks.load(Ordering::Relaxed),
                bloom: self.inner.bloom_clicks.load(Ordering::Relaxed),
            },
        };

        if let Some(parent) = self.inner.store_path.parent() {
            let _ = fs::create_dir_all(parent);
        }

        if let Ok(data) = serde_json::to_vec_pretty(&stored_state) {
            let temporary_path = self.inner.store_path.with_extension("json.tmp");
            let _ = fs::write(&temporary_path, data);
            let _ = fs::rename(&temporary_path, &self.inner.store_path);
        }
    }
}

impl Default for CounterState {
    fn default() -> Self {
        Self::new()
    }
}

impl Drop for CounterStateInner {
    fn drop(&mut self) {
        let stored_state = StoredCounterState {
            global_clicks: self.count.load(Ordering::Relaxed),
            started_at_unix_ms: self.started_at_unix_ms.load(Ordering::Relaxed),
            source_clicks: StoredSourceClicks {
                click_audit: self.click_audit_clicks.load(Ordering::Relaxed),
                fidget: self.fidget_clicks.load(Ordering::Relaxed),
                bloom: self.bloom_clicks.load(Ordering::Relaxed),
            },
        };

        if let Some(parent) = self.store_path.parent() {
            let _ = fs::create_dir_all(parent);
        }

        if let Ok(data) = serde_json::to_vec_pretty(&stored_state) {
            let temporary_path = self.store_path.with_extension("json.tmp");
            let _ = fs::write(&temporary_path, data);
            let _ = fs::rename(&temporary_path, &self.store_path);
        }
    }
}

fn read_stored_state(path: &PathBuf) -> StoredCounterState {
    fs::read(path)
        .ok()
        .and_then(|data| serde_json::from_slice::<StoredCounterState>(&data).ok())
        .unwrap_or_default()
}

fn get_store_path() -> PathBuf {
    ProjectDirs::from("dev", "k0rp", "ClickAudit")
        .map(|dirs| dirs.data_local_dir().join("state.json"))
        .unwrap_or_else(|| PathBuf::from(".click-audit-state.json"))
}

fn current_unix_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64
}
