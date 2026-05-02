import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ArticleImageGallery from "./ArticleImageGallery";

function formatArticleDate(dateValue) {
  if (!dateValue) return "";
  if (/^\d{4}$/.test(String(dateValue))) return String(dateValue);

  const date = new Date(`${dateValue}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return String(dateValue);

  return date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function splitTranscript(transcript) {
  return String(transcript || "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function ArticleDetailPage({ articlesPath, basePath, backLabel, backPath }) {
  const { articleId } = useParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadArticles() {
      try {
        const response = await fetch(articlesPath);
        const data = response.ok ? await response.json() : [];
        if (!cancelled) setArticles(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load article data:", error);
        if (!cancelled) setArticles([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadArticles();

    return () => {
      cancelled = true;
    };
  }, [articlesPath]);

  const article = useMemo(
    () => articles.find((entry) => String(entry.ArticleID) === String(articleId)),
    [articleId, articles]
  );

  if (loading) return <div className="mx-auto max-w-5xl p-4">Loading article...</div>;
  if (!article) return <div className="mx-auto max-w-5xl p-4">Article not found.</div>;

  const articleDate = formatArticleDate(article.Date);
  const meta = [articleDate, article.Source, article.Author ? `By ${article.Author}` : ""]
    .filter(Boolean)
    .join(" • ");
  const transcriptParagraphs = splitTranscript(article.Transcript);

  return (
    <article className="mx-auto max-w-5xl space-y-8 p-4">
      <div>
        <Link to={backPath || basePath} className="text-sm font-semibold text-blue-700 underline">
          Back to {backLabel}
        </Link>
      </div>

      <header className="space-y-3 border-b border-gray-200 pb-6">
        {meta && <p className="text-sm font-semibold uppercase text-gray-500">{meta}</p>}
        <h1 className="text-3xl font-bold leading-tight text-gray-950">{article.Title}</h1>
        {article.Subtitle && (
          <p className="text-lg font-medium leading-8 text-gray-700">{article.Subtitle}</p>
        )}
        {article.Summary && <p className="max-w-3xl leading-7 text-gray-600">{article.Summary}</p>}
      </header>

      {article.DocumentPath && (
        <section className="space-y-4">
          <div>
            <a
              href={article.DocumentPath}
              target="_blank"
              rel="noreferrer"
              className="inline-flex text-sm font-semibold text-blue-700 underline hover:text-blue-900"
            >
              Open original document
            </a>
          </div>
          <iframe
            src={article.DocumentPath}
            title={article.Title}
            className="h-[75vh] w-full border border-gray-200 bg-white"
          />
        </section>
      )}

      {article.Images?.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Original Article Images</h2>
          <ArticleImageGallery images={article.Images} title={article.Title} />
        </section>
      )}

      {transcriptParagraphs.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Transcript</h2>
          <div className="space-y-4 text-base leading-7 text-gray-800">
            {transcriptParagraphs.map((paragraph, index) => (
              <p
                key={`${article.ArticleID}-paragraph-${index}`}
                className={index <= 1 ? "font-semibold text-gray-950" : ""}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

export default ArticleDetailPage;
