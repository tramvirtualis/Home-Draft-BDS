import { useEffect, useState } from "react";
import EventsHero from "../../components/Event/EventsHero";
import EventList from "../../components/Event/EventList";
import EventFilterBar from "../../components/Event/EventFilterBar";
import { useEvents } from "../../hooks/event/useEvents";
import {
  DEFAULT_EVENT_FILTER,
  EVENT_SORT,
  type Event,
  type EventFilter,
  type EventSort,
} from "../../types/event/event.types";

const PAGE_SIZE = 6;

export default function EventsPage() {
  const [filter, setFilter] = useState(DEFAULT_EVENT_FILTER);
  const [sort, setSort] = useState<EventSort>(EVENT_SORT.NEWEST);
  const [page, setPage] = useState(0);

  const { data, loading, error, refetch } = useEvents({
    filter,
    sort,
    page,
    size: PAGE_SIZE,
  });

  // Hero giữ cố định theo lần tải đầu (không đổi theo bộ lọc / trang đang xem).
  // heroLoaded = false cho đến khi lần tải đầu xong -> hero hiện skeleton
  const [featured, setFeatured] = useState<Event[]>([]);
  const [heroLoaded, setHeroLoaded] = useState(false);
  useEffect(() => {
    if (heroLoaded || loading) return;
    setFeatured(data?.content ?? []);
    setHeroLoaded(true);
  }, [loading, heroLoaded, data]);

  const handleSearch = (newFilter: EventFilter) => {
    setFilter(newFilter);
    setPage(0);
  };

  const handleSortChange = (newSort: EventSort) => {
    setSort(newSort);
    setPage(0);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <EventsHero events={featured} loading={!heroLoaded} />
      <EventList
        filterBar={<EventFilterBar value={filter} onSearch={handleSearch} />}
        events={data.content}
        total={data.totalElements}
        loading={loading}
        error={error}
        onRetry={refetch}
        sort={sort}
        onSortChange={handleSortChange}
        page={page}
        totalPages={data.totalPages}
        onPageChange={handlePageChange}
        onReset={() => handleSearch(DEFAULT_EVENT_FILTER)}
      />
    </>
  );
}
