CREATE TABLE reading_plans (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    daily_chapter_target INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
    created_at TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT chk_reading_plans_daily_target
        CHECK (daily_chapter_target BETWEEN 1 AND 10)
);

CREATE UNIQUE INDEX uk_reading_plans_user_in_progress
    ON reading_plans(user_id)
    WHERE status = 'IN_PROGRESS';

CREATE TABLE reading_plan_items (
    id BIGSERIAL PRIMARY KEY,
    plan_id BIGINT NOT NULL REFERENCES reading_plans(id) ON DELETE CASCADE,
    day_number INT NOT NULL,
    book_code VARCHAR(10) NOT NULL,
    chapter_num INT NOT NULL,
    item_order INT NOT NULL,

    CONSTRAINT uk_reading_plan_items_plan_book_chapter
        UNIQUE (plan_id, book_code, chapter_num),

    CONSTRAINT uk_reading_plan_items_plan_order
        UNIQUE (plan_id, item_order)
);

CREATE INDEX idx_reading_plan_items_plan_day
    ON reading_plan_items(plan_id, day_number);

CREATE TABLE reading_progress (
    id BIGSERIAL PRIMARY KEY,
    plan_id BIGINT NOT NULL REFERENCES reading_plans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_code VARCHAR(10) NOT NULL,
    chapter_num INT NOT NULL,
    completed_at TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT uk_reading_progress_plan_user_chapter
        UNIQUE (plan_id, user_id, book_code, chapter_num)
);

CREATE INDEX idx_reading_progress_plan_user
    ON reading_progress(plan_id, user_id);
