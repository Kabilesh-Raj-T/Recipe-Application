# Recipe Box

A minimalistic recipe application and smart shopping list builder.

## Supabase Setup
1. Create a new project in [Supabase](https://supabase.com/).
2. Run the SQL script found at `backend/schema.sql` in the Supabase SQL Editor. This will generate the exact tables required (`recipes`, `recipe_ingredients`, `steps`) with row-level security (RLS) properly enabled to lock out anonymous keys.
3. Obtain your database connection string via **Project Settings -> Database**. You will want the **Transaction mode** connection string (using port `6543`) which is built for the Supabase Connection Pooler.

**DATABASE_URL Format Example:**
```
postgresql://postgres.your_project_id:your_password@aws-0-region.pooler.supabase.com:6543/postgres
```
*(Note: Because this uses port 6543 and PgBouncer, prepared statements are disabled under the hood in SQLAlchemy via the connection setup in db.py).*

## Local Development
If you're running locally with a standard postgres or testing sqlite:

### 1. Setup Backend
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
```
Set up your local `.env` variables or just export them:
```bash
export DATABASE_URL="postgresql://user:pass@localhost:5432/postgres"
# (Alternatively, you can just use sqlite:///local.db for quick testing)
```

### 2. Seed Database
You can safely test the overlapping capabilities of the shopping list by running the seeder script locally:
```bash
# In the project root:
export PYTHONPATH="."
python backend/seed.py
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Run Flask Server
```bash
# In the project root:
export PYTHONPATH="."
python backend/app.py
```
*(The Flask dev server runs on port 5000, and the Vite proxy correctly routes `/api/*` to it).*

## Deploying to Render
This application has been unified to run seamlessly out of a single integrated web service.

The repo ships a `render.yaml` blueprint, so the easiest path is **New > Blueprint** in
Render and point it at this repository. It picks up the commands below automatically, and
the only thing left to do by hand is fill in `DATABASE_URL`.

If you would rather configure a Web Service manually, use these specs:

* **Build Command**: `pip install -r requirements.txt && cd frontend && npm ci && npm run build`
* **Start Command**: `python -m gunicorn --bind 0.0.0.0:$PORT backend.app:app`
* **Environment Variables**:
  * `DATABASE_URL` = `postgresql://...:6543/...` (Supabase connection string)

Both commands run from the **repo root**, which matters:

* `backend/app.py` imports its siblings as a package (`from backend.db import engine`). Starting
  with `cd backend && gunicorn app:app` puts the wrong directory on `sys.path` and the boot fails
  with `ModuleNotFoundError: No module named 'backend'`.
* The root `requirements.txt` exists only so Render's Python runtime detects the project as
  Python; it simply includes `backend/requirements.txt`, where the real dependency list lives.
  Without a pip install in the build step you get `gunicorn: command not found` at startup.
* The start command uses `python -m gunicorn` rather than bare `gunicorn`, so it does not depend
  on the console script landing on `PATH`.
* Gunicorn binds `127.0.0.1:8000` by default, which Render's proxy cannot reach ("no open ports
  detected"). `--bind 0.0.0.0:$PORT` is required.
* `frontend/dist/` is gitignored, so the `npm run build` step is what produces the static files
  that Flask serves in the deployed service.

Flask is configured natively to intercept non-API requests and serve the `frontend/dist/index.html` file to support robust client-side routing on refresh!
