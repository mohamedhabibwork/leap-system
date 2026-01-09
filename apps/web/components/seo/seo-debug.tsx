'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Eye, EyeOff, Copy, CheckCircle2 } from 'lucide-react';

interface MetaTag {
  name?: string;
  property?: string;
  content?: string;
  [key: string]: string | undefined;
}

export function SEODebug() {
  const [isVisible, setIsVisible] = useState(false);
  const [metaTags, setMetaTags] = useState<MetaTag[]>([]);
  const [jsonLd, setJsonLd] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Only show in development
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    // Parse meta tags
    const tags: MetaTag[] = [];
    document.querySelectorAll('meta').forEach((meta) => {
      const tag: MetaTag = {};
      Array.from(meta.attributes).forEach((attr) => {
        tag[attr.name] = attr.value;
      });
      tags.push(tag);
    });
    setMetaTags(tags);

    // Parse JSON-LD schemas
    const scripts: string[] = [];
    document
      .querySelectorAll('script[type="application/ld+json"]')
      .forEach((script) => {
        if (script.textContent) {
          try {
            const parsed = JSON.parse(script.textContent);
            scripts.push(JSON.stringify(parsed, null, 2));
          } catch (e) {
            scripts.push(script.textContent);
          }
        }
      });
    setJsonLd(scripts);
  }, []);

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 shadow-lg"
        size="sm"
      >
        <Eye className="mr-2 h-4 w-4" />
        SEO Debug
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[600px] max-h-[80vh] overflow-auto shadow-2xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-bold">SEO Debug Panel</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Page Title */}
          <div>
            <h3 className="font-semibold text-sm mb-2">Page Title</h3>
            <p className="text-sm bg-gray-50 p-2 rounded">
              {document.title || 'No title'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Length: {document.title.length} characters
              {document.title.length > 60 && (
                <Badge variant="destructive" className="ml-2">
                  Too long
                </Badge>
              )}
            </p>
          </div>

          {/* Canonical URL */}
          <div>
            <h3 className="font-semibold text-sm mb-2">Canonical URL</h3>
            <p className="text-sm bg-gray-50 p-2 rounded break-all">
              {document.querySelector('link[rel="canonical"]')?.getAttribute('href') ||
                'Not set'}
            </p>
          </div>

          {/* Meta Description */}
          <div>
            <h3 className="font-semibold text-sm mb-2">Meta Description</h3>
            {(() => {
              const description =
                document
                  .querySelector('meta[name="description"]')
                  ?.getAttribute('content') || 'Not set';
              return (
                <>
                  <p className="text-sm bg-gray-50 p-2 rounded">{description}</p>
                  {description !== 'Not set' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Length: {description.length} characters
                      {description.length > 160 && (
                        <Badge variant="destructive" className="ml-2">
                          Too long
                        </Badge>
                      )}
                      {description.length < 120 && (
                        <Badge variant="secondary" className="ml-2">
                          Could be longer
                        </Badge>
                      )}
                    </p>
                  )}
                </>
              );
            })()}
          </div>

          {/* Robots */}
          <div>
            <h3 className="font-semibold text-sm mb-2">Robots Directives</h3>
            <p className="text-sm bg-gray-50 p-2 rounded">
              {document.querySelector('meta[name="robots"]')?.getAttribute('content') ||
                'index, follow (default)'}
            </p>
          </div>

          {/* OpenGraph Tags */}
          <div>
            <h3 className="font-semibold text-sm mb-2">OpenGraph Tags</h3>
            <div className="space-y-1 max-h-48 overflow-auto bg-gray-50 p-2 rounded">
              {metaTags
                .filter((tag) => tag.property?.startsWith('og:'))
                .map((tag, idx) => (
                  <div key={idx} className="text-xs font-mono">
                    <span className="text-blue-600">{tag.property}:</span>{' '}
                    <span className="text-gray-700">{tag.content}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Twitter Card Tags */}
          <div>
            <h3 className="font-semibold text-sm mb-2">Twitter Card Tags</h3>
            <div className="space-y-1 max-h-48 overflow-auto bg-gray-50 p-2 rounded">
              {metaTags
                .filter((tag) => tag.name?.startsWith('twitter:'))
                .map((tag, idx) => (
                  <div key={idx} className="text-xs font-mono">
                    <span className="text-blue-600">{tag.name}:</span>{' '}
                    <span className="text-gray-700">{tag.content}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* JSON-LD Schemas */}
          {jsonLd.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm mb-2">
                JSON-LD Structured Data ({jsonLd.length})
              </h3>
              <div className="space-y-2">
                {jsonLd.map((schema, idx) => {
                  const schemaObj = JSON.parse(schema);
                  return (
                    <div key={idx} className="relative">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline">
                          {schemaObj['@type'] || 'Unknown Type'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(schema, idx)}
                        >
                          {copiedIndex === idx ? (
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <pre className="text-xs bg-gray-900 text-gray-100 p-2 rounded overflow-x-auto max-h-64">
                        {schema}
                      </pre>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm mb-2">Testing Tools</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <a
                  href={`https://www.opengraph.xyz/url/${encodeURIComponent(
                    window.location.href
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  OG Debugger
                </a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <a
                  href={`https://cards-dev.twitter.com/validator`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Twitter Card
                </a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <a
                  href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(
                    window.location.href
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Rich Results
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
