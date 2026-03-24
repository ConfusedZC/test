import React from "react";
import { Link } from "react-router-dom";

import {
  fetchCatalogFilterOptions,
  fetchProducts,
  type CatalogFilterOptions,
  type ProductListRow,
} from "./api";
import { SectionCard, SummaryPill } from "./ui";
import { Pagination } from "../../shared/ui/Pagination";
import { StatePanel } from "../../shared/ui/StatePanel";
import "./styles.css";

type FilterState = {
  keyword: string;
  brandName: string;
  category: string;
  status: string;
};

const initialFilters: FilterState = {
  keyword: "",
  brandName: "",
  category: "",
  status: "",
};

export function ProductListPage() {
  const [draftFilters, setDraftFilters] = React.useState<FilterState>(initialFilters);
  const [appliedFilters, setAppliedFilters] = React.useState<FilterState>(initialFilters);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);
  const [items, setItems] = React.useState<ProductListRow[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [filterOptions, setFilterOptions] = React.useState<CatalogFilterOptions>({
    brands: [],
    categories: [],
    statuses: [],
  });
  const [filterOptionsLoading, setFilterOptionsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    async function loadProducts() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchProducts(
          {
            page: page,
            pageSize,
            keyword: appliedFilters.keyword.trim() || undefined,
            brandName: appliedFilters.brandName.trim() || undefined,
            category: appliedFilters.category.trim() || undefined,
            status: appliedFilters.status.trim() || undefined,
          },
          controller.signal,
        );

        if (!isActive) {
          return;
        }

        setItems(response.items);
        setTotalCount(response.totalCount);
      } catch (error_) {
        if (!isActive) {
          return;
        }
        setError(error_ instanceof Error ? error_.message : "加载商品列表失败");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [appliedFilters, page, pageSize]);

  React.useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    async function loadFilterOptions() {
      setFilterOptionsLoading(true);

      try {
        const options = await fetchCatalogFilterOptions(controller.signal);
        if (!isActive) {
          return;
        }
        setFilterOptions(options);
      } catch {
        if (!isActive) {
          return;
        }
        setFilterOptions({ brands: [], categories: [], statuses: [] });
      } finally {
        if (isActive) {
          setFilterOptionsLoading(false);
        }
      }
    }

    loadFilterOptions();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, []);

  const activeCount = items.filter((item) => item.status === "active").length;
  const draftCount = items.filter((item) => item.status === "draft").length;
  const archivedCount = items.filter((item) => item.status === "archived").length;

  function handleSearch() {
    setPage(1);
    setAppliedFilters({ ...draftFilters });
  }

  function handleReset() {
    setDraftFilters({ ...initialFilters });
    setPage(1);
    setAppliedFilters({ ...initialFilters });
  }

  return (
    <div className="pc-page">
      <div className="pc-shell">
        <section className="pc-page-hero pc-page-hero--catalog">
          <div className="pc-page-hero__copy">
            <div className="pc-page-hero__masthead">
              <span className="pc-page-hero__eyebrow">商品主数据台</span>
              <span className="pc-page-hero__stamp">Catalog Desk</span>
            </div>
            <h1>商品与成本</h1>
            <p>围绕商品主数据、成本口径与异常项做统一维护，让商品、采购和方案查询站在同一套真实数据上。</p>
            <div className="pc-page-hero__tags">
              <span className="pc-badge pc-badge--accent">真实商品主数据</span>
              <span className="pc-badge pc-badge--neutral">成本历史回溯</span>
              <span className="pc-badge pc-badge--warning">异常项待治理</span>
            </div>
          </div>
          <div className="pc-page-hero__aside pc-page-hero__aside--stats">
            <div className="pc-page-hero__stat">
              <span>总量</span>
              <strong>{loading ? "..." : String(totalCount)}</strong>
            </div>
            <div className="pc-page-hero__stat">
              <span>启用</span>
              <strong>{loading ? "..." : String(activeCount)}</strong>
            </div>
            <div className="pc-page-hero__stat">
              <span>归档 / 草稿</span>
              <strong>{loading ? "..." : `${archivedCount} / ${draftCount}`}</strong>
            </div>
          </div>
          <div className="pc-page-hero__actions">
            <Link className="pc-button pc-button--secondary" to="/catalog/pricing">
              临时核价
            </Link>
            <button className="pc-button pc-button--primary" type="button">
              新增商品
            </button>
          </div>
        </section>

        <div className="pc-grid-3 pc-grid-3--heroStats">
          <SummaryPill label="商品总数" value={loading ? "..." : String(totalCount)} />
          <SummaryPill label="当前页启用" value={loading ? "..." : String(activeCount)} />
          <SummaryPill label="当前页归档 / 草稿" value={loading ? "..." : `${archivedCount} / ${draftCount}`} />
        </div>

        <SectionCard
          title="商品总表"
          description="支持关键词、品牌、分类和状态筛选，当前接入真实后端 `/api/products`。"
          action={
            <Link className="pc-button pc-button--ghost" to="/catalog/pricing">
              打开临时核价
            </Link>
          }
        >
          <div className="pc-section-intro">
            <div>
              <strong>当前范围</strong>
              <p>优先处理会直接影响核价、报价和方案生成的商品主数据与成本口径。</p>
            </div>
            <div className="pc-section-intro__meta">
              <span>分页数据</span>
              <strong>{loading ? "加载中" : `共 ${totalCount} 条`}</strong>
            </div>
          </div>

          <div className="pc-filter-panel pc-filter-panel--elevated">
            <div className="pc-filter-panel__heading">
              <div>
                <strong>筛选条件</strong>
                <p>按关键词、品牌、分类和状态快速定位商品，再进入详情核查成本与别名。</p>
              </div>
            </div>
            <div className="pc-filter-grid">
              <label className="pc-field">
                <span>关键词</span>
                <input
                  className="pc-input"
                  placeholder="搜索商品 / 条码 / 规格 / 箱规"
                  value={draftFilters.keyword}
                  onChange={(event) => setDraftFilters((prev) => ({ ...prev, keyword: event.target.value }))}
                />
              </label>
              <label className="pc-field">
                <span>品牌</span>
                <select
                  className="pc-select"
                  value={draftFilters.brandName}
                  onChange={(event) => setDraftFilters((prev) => ({ ...prev, brandName: event.target.value }))}
                  disabled={filterOptionsLoading && filterOptions.brands.length === 0}
                >
                  <option value="">{filterOptionsLoading ? "品牌加载中..." : "全部品牌"}</option>
                  {filterOptions.brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </label>
              <label className="pc-field">
                <span>分类</span>
                <select
                  className="pc-select"
                  value={draftFilters.category}
                  onChange={(event) => setDraftFilters((prev) => ({ ...prev, category: event.target.value }))}
                  disabled={filterOptionsLoading && filterOptions.categories.length === 0}
                >
                  <option value="">{filterOptionsLoading ? "分类加载中..." : "全部分类"}</option>
                  {filterOptions.categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              <label className="pc-field">
                <span>状态</span>
                <select
                  className="pc-select"
                  value={draftFilters.status}
                  onChange={(event) => setDraftFilters((prev) => ({ ...prev, status: event.target.value }))}
                >
                  <option value="">全部状态</option>
                  {(filterOptions.statuses.length > 0 ? filterOptions.statuses : ["active", "draft", "archived"]).map(
                    (status) => (
                      <option key={status} value={status}>
                        {statusLabel(status)}
                      </option>
                    ),
                  )}
                </select>
              </label>
            </div>
            <div className="pc-filter-actions">
              <button className="pc-button pc-button--primary" type="button" onClick={handleSearch}>
                查询
              </button>
              <button className="pc-button pc-button--secondary" type="button" onClick={handleReset}>
                重置
              </button>
            </div>
          </div>
          {loading ? (
            <StatePanel
              title="正在加载"
              description="正在从后端拉取商品列表和分页数据。"
              tone="neutral"
            />
          ) : error ? (
            <StatePanel
              title="加载失败"
              description={error}
              tone="danger"
              action={
                <button className="pc-button pc-button--secondary" type="button" onClick={handleSearch}>
                  重新加载
                </button>
              }
            />
          ) : items.length === 0 ? (
            <StatePanel
              title="没有匹配结果"
              description="当前筛选条件下没有找到商品，可以放宽关键词或重置筛选。"
              tone="warning"
              action={
                <button className="pc-button pc-button--secondary" type="button" onClick={handleReset}>
                  清空筛选
                </button>
              }
            />
          ) : (
            <>
              <div className="pc-table-section">
                <div className="pc-table-section__head">
                  <div>
                    <strong>商品列表</strong>
                    <p>列表优先展示品牌、规格、箱规和当前成本，便于快速进入详情核查。</p>
                  </div>
                  <span className="pc-table-section__summary">
                    当前第 {page} 页，显示 {items.length} 条，后端总数 {totalCount} 条。
                  </span>
                </div>
              </div>
              <div className="pc-product-table__wrap">
                <table className="pc-product-table">
                  <thead>
                    <tr>
                      <th className="pc-product-table__col pc-product-table__col--name">商品名称</th>
                      <th className="pc-product-table__col pc-product-table__col--brand">品牌</th>
                      <th className="pc-product-table__col pc-product-table__col--barcode">条码</th>
                      <th className="pc-product-table__col pc-product-table__col--category">分类</th>
                      <th className="pc-product-table__col pc-product-table__col--spec">规格</th>
                      <th className="pc-product-table__col pc-product-table__col--box-spec">箱规</th>
                      <th className="pc-product-table__col pc-product-table__col--cost">当前成本</th>
                      <th className="pc-product-table__col pc-product-table__col--status">状态</th>
                      <th className="pc-product-table__col pc-product-table__col--updated-at">更新时间</th>
                      <th className="pc-product-table__col pc-product-table__col--action">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.productId}>
                        <td className="pc-product-table__col pc-product-table__col--name">
                          <span className="pc-product-table__name" title={item.name}>
                            {item.name}
                          </span>
                        </td>
                        <td className="pc-product-table__col pc-product-table__col--brand">
                          <span className="pc-product-table__text" title={item.brandName}>
                            {item.brandName}
                          </span>
                        </td>
                        <td className="pc-product-table__col pc-product-table__col--barcode">
                          <span className="pc-product-table__text" title={item.barcode}>
                            {item.barcode}
                          </span>
                        </td>
                        <td className="pc-product-table__col pc-product-table__col--category">
                          <span className="pc-product-table__text" title={item.category}>
                            {item.category}
                          </span>
                        </td>
                        <td className="pc-product-table__col pc-product-table__col--spec">
                          <div className="pc-product-table__spec">
                            <strong className={item.spec === "待补规格" ? "pc-product-table__spec--pending" : ""}>
                              {item.spec}
                            </strong>
                            {item.spec === "待补规格" ? <span>待补规格</span> : null}
                          </div>
                        </td>
                        <td className="pc-product-table__col pc-product-table__col--box-spec">{item.boxSpec}</td>
                        <td className="pc-product-table__col pc-product-table__col--cost">
                          <div className="pc-product-table__cost">
                            <strong className={item.listPriceText === "-" ? "pc-product-table__cost--pending" : ""}>
                              {item.listPriceText === "-" ? "待补成本" : item.listPriceText}
                            </strong>
                            {item.listPriceSecondaryText ? <span>{item.listPriceSecondaryText}</span> : null}
                            {!item.listPriceSecondaryText && item.listPriceTag ? (
                              <div style={{ marginTop: 4 }}>
                                <span className="pc-badge pc-badge--neutral">{item.listPriceTag}</span>
                              </div>
                            ) : null}
                          </div>
                        </td>
                        <td className="pc-product-table__col pc-product-table__col--status">
                          <span className="pc-product-table__text">{statusLabel(item.status)}</span>
                        </td>
                        <td className="pc-product-table__col pc-product-table__col--updated-at" title={item.updatedAt}>
                          <span className="pc-product-table__text">{item.updatedAt}</span>
                        </td>
                        <td className="pc-product-table__col pc-product-table__col--action">
                          <Link className="pc-button pc-button--ghost" to={`/catalog/products/${item.productId}`}>
                            查看
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={page}
                pageSize={pageSize}
                totalCount={totalCount}
                onPageChange={setPage}
                onPageSizeChange={(nextPageSize) => {
                  setPageSize(nextPageSize);
                  setPage(1);
                }}
              />
            </>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

function statusLabel(status: string) {
  if (status === "active") {
    return "启用";
  }
  if (status === "draft") {
    return "草稿";
  }
  if (status === "archived") {
    return "归档";
  }
  return status || "-";
}
