import React from 'react';
import { Card, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

interface StatCardProps {
  title: string;
  value: number | string;
  prefix?: React.ReactNode;
  suffix?: string;
  trend?: number;
  trendText?: string;
  color?: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  prefix,
  suffix,
  trend,
  trendText,
  color = '#3f8600',
  loading = false,
}) => {
  const isPositiveTrend = trend !== undefined && trend >= 0;

  return (
    <Card loading={loading}>
      <Statistic
        title={title}
        value={value}
        prefix={prefix}
        suffix={suffix}
        valueStyle={{ color }}
      />
      {trend !== undefined && (
        <div style={{ marginTop: 8, fontSize: 12, color: '#666', display: 'flex', alignItems: 'center', gap: 4 }}>
          {isPositiveTrend ? (
            <ArrowUpOutlined style={{ color: '#52c41a', fontSize: 14 }} />
          ) : (
            <ArrowDownOutlined style={{ color: '#f5222d', fontSize: 14 }} />
          )}
          <span style={{ color: isPositiveTrend ? '#52c41a' : '#f5222d' }}>
            {Math.abs(trend)}%
          </span>
          <span>{trendText || 'за период'}</span>
        </div>
      )}
    </Card>
  );
};

export default StatCard;


