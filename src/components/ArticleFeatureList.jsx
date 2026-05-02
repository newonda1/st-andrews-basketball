import React from "react";
import { Link } from "react-router-dom";

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

function getArticleThumbnail(article) {
  const firstImage = Array.isArray(article?.Images) ? article.Images[0] : null;
  if (typeof firstImage === "string") return firstImage;
  return firstImage?.src || "";
}

function ArticleFeatureList({ articles, basePath, heading = "Featured Articles" }) {
  const visibleArticles = Array.isArray(articles)
    ? articles.filter((article) => article?.ArticleID)
    : [];

  if (!visibleArticles.length) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold">{heading}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {visibleArticles.map((article) => {
          const thumbnail = getArticleThumbnail(article);
          const articleDate = formatArticleDate(article.Date);
          const meta = [articleDate, article.Source].filter(Boolean).join(" • ");

          return (
            <article
              key={article.ArticleID}
              className="overflow-hidden border border-gray-200 bg-white shadow-sm"
            >
              {thumbnail && (
                <Link to={`${basePath}/articles/${article.ArticleID}`} className="block bg-gray-100">
                  <img
                    src={thumbnail}
                    alt={article.Title}
                    className="h-48 w-full object-cover object-top"
                    loading="lazy"
                  />
                </Link>
              )}
              <div className="space-y-2 p-4">
                {meta && <p className="text-xs font-semibold uppercase text-gray-500">{meta}</p>}
                <h3 className="text-lg font-bold leading-snug text-gray-950">
                  <Link
                    to={`${basePath}/articles/${article.ArticleID}`}
                    className="text-blue-700 underline hover:text-blue-900"
                  >
                    {article.Title}
                  </Link>
                </h3>
                {article.Subtitle && (
                  <p className="text-sm font-medium leading-6 text-gray-700">
                    {article.Subtitle}
                  </p>
                )}
                {article.Summary && (
                  <p className="text-sm leading-6 text-gray-600">{article.Summary}</p>
                )}
                <Link
                  to={`${basePath}/articles/${article.ArticleID}`}
                  className="inline-flex text-sm font-semibold text-blue-700 underline hover:text-blue-900"
                >
                  Read article
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default ArticleFeatureList;
