# Andy Fu · Portfolio

Personal portfolio site, built with Jekyll and hosted free on GitHub Pages. No build tools needed: push to GitHub and the site updates itself.

## Put it online (one time)

1. Create a GitHub repository named **`USERNAME.github.io`** (replace `USERNAME` with your GitHub username). This gives you the address `https://USERNAME.github.io`.
2. Upload everything in this folder to that repo (drag the files into the GitHub web page, or use GitHub Desktop / `git push`).
3. In the repo, go to **Settings → Pages**. Under "Build and deployment", set Source to **Deploy from a branch**, branch **main**, folder **/ (root)**. Save.
4. Wait 1–2 minutes, then open `https://USERNAME.github.io`.
5. Fill in your GitHub username and LinkedIn URL in `_data/profile.yml`, and set `url` in `_config.yml`.

If you name the repo something else (e.g. `portfolio`), the address becomes `https://USERNAME.github.io/portfolio` and you must set `baseurl: "/portfolio"` in `_config.yml`.

## Add a new project

1. Copy `PROJECT_TEMPLATE.md` into the `_projects/` folder and rename it, e.g. `_projects/my-new-project.md`.
2. Make a folder `assets/projects/my-new-project/` and put the images and PDFs in it.
3. Edit the header block (title, summary, tags, images…) and write the page below it in Markdown.
4. Set `order:` to decide where it appears on the home page.
5. Commit and push. The home page card, tag filters and next/previous links update automatically.

To hide a project without deleting it, add `published: false` to its header.

### Showing images inside a project page

```liquid
{% include figure.html src="/assets/projects/my-new-project/photo.png" caption="What this shows." %}
```

Several images side by side:

```html
<div class="gallery">
{% include figure.html src="/assets/projects/my-new-project/a.png" caption="A" %}
{% include figure.html src="/assets/projects/my-new-project/b.png" caption="B" %}
</div>
```

Every image opens full-size when clicked.

A video (MP4, H.264, keep it under ~5 MB):

```liquid
{% include video.html src="/assets/projects/my-new-project/demo.mp4" poster="/assets/projects/my-new-project/demo.jpg" caption="What it shows." %}
```

To put an autoplaying video at the top of a project page instead of an image, add `hero_video: /assets/projects/my-new-project/demo.mp4` to the header (keep `hero:` as its still image).

## Where things are

| File / folder | What it controls |
|---|---|
| `_data/profile.yml` | Your name, intro, email, GitHub, LinkedIn, resume link |
| `_data/experience.yml` | The Experience list on the home page |
| `_projects/` | One Markdown file per project |
| `assets/projects/<name>/` | Images and PDFs for each project |
| `assets/resume.pdf` | Your resume (replace the file to update it) |
| `assets/css/style.css` | Colors and fonts (change the variables at the top) |

## Preview locally (optional)

With Ruby installed: `bundle install` then `bundle exec jekyll serve`, and open http://localhost:4000.
