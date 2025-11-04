import jsPDF from 'jspdf';
import type { Brief } from '@/types/mindshare';
import { calculateAggregateStats } from './complianceScoring';

export function exportAuditReport(briefs: Brief[], filters: any) {
  const stats = calculateAggregateStats(briefs);
  
  // Count topics
  const topicCounts: Record<string, number> = {};
  briefs.forEach(brief => {
    brief.topics.forEach(topic => {
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });
  });
  
  const topTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  // Count weak topics
  const weakTopicCounts: Record<string, number> = {};
  briefs.forEach(brief => {
    brief.weakTopics.forEach(topic => {
      weakTopicCounts[topic] = (weakTopicCounts[topic] || 0) + 1;
    });
  });
  
  const topWeakTopics = Object.entries(weakTopicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  // Lowest IQ advisors
  const advisorStats = new Map<string, { name: string; office: string; iqSum: number; count: number }>();
  briefs.forEach(brief => {
    const key = brief.advisor.id;
    if (!advisorStats.has(key)) {
      advisorStats.set(key, {
        name: brief.advisor.name,
        office: brief.office,
        iqSum: 0,
        count: 0
      });
    }
    const stats = advisorStats.get(key)!;
    stats.iqSum += brief.complianceIQ;
    stats.count++;
  });
  
  const allAdvisorAvgs = Array.from(advisorStats.entries())
    .map(([id, data]) => ({
      name: data.name,
      office: data.office,
      avgIQ: Math.round(data.iqSum / data.count)
    }))
    .sort((a, b) => a.avgIQ - b.avgIQ);
  
  const advisorAvgs = allAdvisorAvgs.slice(0, Math.min(10, Math.ceil(allAdvisorAvgs.length * 0.1)));
  
  // Sample redlines
  const sampleRedlines = briefs
    .filter(b => b.flags.length > 0)
    .slice(0, 3)
    .flatMap(b => b.flags.slice(0, 2));
  
  // Generate JSON
  const jsonData = {
    exportDate: new Date().toISOString(),
    filters,
    summary: {
      totalBriefs: stats.totalBriefs,
      avgComplianceIQ: stats.avgComplianceIQ,
      avgFlagsPerBrief: stats.avgFlagsPerBrief
    },
    topTopics: topTopics.map(([topic, count]) => ({
      topic: topic.replace(/_/g, ' '),
      count
    })),
    topWeakTopics: topWeakTopics.map(([topic, count]) => ({
      topic: topic.replace(/_/g, ' '),
      count
    })),
    lowestIQAdvisors: advisorAvgs,
    sampleRedlines: sampleRedlines.map(f => ({
      forbiddenPhrase: f.text,
      reason: f.reason,
      suggestedFix: f.fix
    }))
  };
  
  // Download JSON
  const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
  const jsonUrl = URL.createObjectURL(jsonBlob);
  const jsonLink = document.createElement('a');
  jsonLink.href = jsonUrl;
  jsonLink.download = `mindshare-audit-${new Date().toISOString().split('T')[0]}.json`;
  jsonLink.click();
  URL.revokeObjectURL(jsonUrl);
  
  // Generate PDF
  const pdf = new jsPDF();
  let y = 20;
  
  // Header
  pdf.setFontSize(18);
  pdf.text('NYL Mindshare Map - Audit Report', 20, y);
  y += 10;
  
  pdf.setFontSize(10);
  pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, y);
  y += 5;
  pdf.text(`Demo Mode: Synthetic Data`, 20, y);
  y += 15;
  
  // Summary
  pdf.setFontSize(14);
  pdf.text('Executive Summary', 20, y);
  y += 8;
  
  pdf.setFontSize(10);
  pdf.text(`Total Briefs Analyzed: ${stats.totalBriefs}`, 25, y);
  y += 6;
  pdf.text(`Average Compliance IQ: ${stats.avgComplianceIQ}`, 25, y);
  y += 6;
  pdf.text(`Average Flags per Brief: ${stats.avgFlagsPerBrief}`, 25, y);
  y += 12;
  
  // Top Topics
  pdf.setFontSize(14);
  pdf.text('Top 5 Topics by Volume', 20, y);
  y += 8;
  
  pdf.setFontSize(9);
  topTopics.forEach(([topic, count]) => {
    pdf.text(`• ${topic.replace(/_/g, ' ')}: ${count} briefs`, 25, y);
    y += 5;
  });
  y += 8;
  
  // Top Weak Topics
  pdf.setFontSize(14);
  pdf.text('Top 5 Weak Topics by IQ Deficit', 20, y);
  y += 8;
  
  pdf.setFontSize(9);
  topWeakTopics.forEach(([topic, count]) => {
    pdf.text(`• ${topic.replace(/_/g, ' ')}: ${count} briefs below threshold`, 25, y);
    y += 5;
  });
  y += 8;
  
  // Lowest IQ Advisors
  if (y > 240) {
    pdf.addPage();
    y = 20;
  }
  
  pdf.setFontSize(14);
  pdf.text('Advisors with Lowest 10% Compliance IQ', 20, y);
  y += 8;
  
  pdf.setFontSize(9);
  advisorAvgs.forEach(advisor => {
    pdf.text(`• ${advisor.name} (${advisor.office}): ${advisor.avgIQ}`, 25, y);
    y += 5;
    if (y > 270) {
      pdf.addPage();
      y = 20;
    }
  });
  y += 8;
  
  // Sample Redlines
  if (y > 200) {
    pdf.addPage();
    y = 20;
  }
  
  pdf.setFontSize(14);
  pdf.text('Sample Compliance Redlines', 20, y);
  y += 8;
  
  pdf.setFontSize(9);
  sampleRedlines.slice(0, 3).forEach(flag => {
    if (y > 250) {
      pdf.addPage();
      y = 20;
    }
    
    pdf.setFont(undefined, 'bold');
    pdf.text(`Forbidden Phrase: "${flag.text}"`, 25, y);
    y += 5;
    
    pdf.setFont(undefined, 'normal');
    const reasonLines = pdf.splitTextToSize(`Reason: ${flag.reason}`, 160);
    reasonLines.forEach((line: string) => {
      pdf.text(line, 25, y);
      y += 4;
    });
    
    pdf.setTextColor(0, 128, 0);
    pdf.text(`Suggested: "${flag.fix}"`, 25, y);
    pdf.setTextColor(0, 0, 0);
    y += 8;
  });
  
  // Footer
  pdf.setFontSize(8);
  pdf.text('Synthetic Demo Data • Not affiliated with any real firm', 20, 285);
  
  // Download PDF
  pdf.save(`mindshare-audit-${new Date().toISOString().split('T')[0]}.pdf`);
}
