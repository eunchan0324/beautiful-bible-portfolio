import BookCommentaryDetail from '@/components/commentary/BookCommentaryDetail';

interface BookCommentaryDetailPageProps {
  params: Promise<{
    bookCode: string;
  }>;
}

export default async function BookCommentaryDetailPage({ params }: BookCommentaryDetailPageProps) {
  const { bookCode } = await params;

  return <BookCommentaryDetail bookCode={bookCode} />;
}
