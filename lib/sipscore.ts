import { getSipScoreColor } from '../constants/theme';
import type { SipReview } from '../types';

const WEIGHTS: Record<string, number> = {
  crispiness: 0.25, flavor: 0.25, ice: 0.10,
  cup: 0.10, value: 0.10, drivethu: 0.10, lime: 0.10,
};

export function computeReviewScore(review: SipReview): number {
  let totalWeight = 0;
  let weightedSum = 0;
  const scores: Record<string, number | null> = {
    crispiness: review.score_crispiness,
    flavor:     review.score_flavor,
    ice:        review.score_ice,
    cup:        review.score_cup,
    value:      review.score_value,
    drivethu:   review.score_drivethu,
    lime:       review.score_lime,
  };
  for (const [cat, weight] of Object.entries(WEIGHTS)) {
    const s = scores[cat];
    if (s !== null && s !== undefined) {
      weightedSum += (s / 5) * 10 * weight;
      totalWeight += weight;
    }
  }
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

export function formatSipScore(score: number | null): string {
  if (score === null) return '—';
  return score.toFixed(1);
}

export function sipScoreColor(score: number | null): string {
  if (score === null) return '#9CA3AF';
  return getSipScoreColor(score);
}

export function sipScoreLabel(score: number | null): string {
  if (score === null) return 'Not enough reviews';
  if (score >= 8.5) return 'Excellent';
  if (score >= 7.0) return 'Good';
  return 'Below average';
}
