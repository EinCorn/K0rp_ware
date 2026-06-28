use serde::Serialize;
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Clone)]
pub struct CounterState {
    inner: Arc<CounterStateInner>,
}

struct CounterStateInner {
    count: AtomicU64,
    running: AtomicBool,
    always_on_top: AtomicBool,
    started_at_unix_ms: AtomicU64,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CounterSnapshot {
    pub app: &'static str,
    pub running: bool,
    pub global_clicks: u64,
    pub started_at_unix_ms: Option<u64>,
    pub always_on_top: bool,
    pub privacy_mode: &'static str,
}

impl CounterState {
    pub fn new() -> Self {
        Self {
            inner: Arc::new(CounterStateInner {
                count: AtomicU64::new(0),
                running: AtomicBool::new(false),
                always_on_top: AtomicBool::new(false),
                started_at_unix_ms: AtomicU64::new(0),
            }),
        }
    }

    pub fn snapshot(&self) -> CounterSnapshot {
        let started_at_unix_ms = match self.inner.started_at_unix_ms.load(Ordering::Relaxed) {
            0 => None,
            value => Some(value),
        };

        CounterSnapshot {
            app: "click-audit",
            running: self.is_running(),
            global_clicks: self.inner.count.load(Ordering::Relaxed),
            started_at_unix_ms,
            always_on_top: self.inner.always_on_top.load(Ordering::Relaxed),
            privacy_mode: "aggregate-only",
        }
    }

    pub fn start(&self) -> CounterSnapshot {
        self.inner.running.store(true, Ordering::Relaxed);

        if self.inner.started_at_unix_ms.load(Ordering::Relaxed) == 0 {
            self.inner
                .started_at_unix_ms
                .store(current_unix_ms(), Ordering::Relaxed);
        }

        self.snapshot()
    }

    pub fn pause(&self) -> CounterSnapshot {
        self.inner.running.store(false, Ordering::Relaxed);
        self.snapshot()
    }

    pub fn reset(&self) -> CounterSnapshot {
        self.inner.count.store(0, Ordering::Relaxed);
        self.inner.started_at_unix_ms.store(0, Ordering::Relaxed);
        self.snapshot()
    }

    pub fn set_always_on_top(&self, enabled: bool) -> CounterSnapshot {
        self.inner.always_on_top.store(enabled, Ordering::Relaxed);
        self.snapshot()
    }

    pub fn add_one(&self) -> Option<CounterSnapshot> {
        if !self.is_running() {
            return None;
        }

        self.inner.count.fetch_add(1, Ordering::Relaxed);
        Some(self.snapshot())
    }

    pub fn is_running(&self) -> bool {
        self.inner.running.load(Ordering::Relaxed)
    }
}

impl Default for CounterState {
    fn default() -> Self {
        Self::new()
    }
}

fn current_unix_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64
}
