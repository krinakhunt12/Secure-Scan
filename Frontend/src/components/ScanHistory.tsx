import React, { useState, useMemo } from 'react';
import { History, ArrowRight, ExternalLink, Calendar, ArrowUp, ArrowDown, Filter, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HistoryItem, RiskLevel } from '../../types';

interface ScanHistoryProps {
	history: HistoryItem[];
}

type SortOrder = 'default' | 'oldest' | 'newest';

function ScanHistory({ history }: ScanHistoryProps) {
	const [sortOrder, setSortOrder] = useState<SortOrder>('default');
	const [searchTerm, setSearchTerm] = useState('');

	const filteredAndSortedHistory = useMemo(() => {
		let items = history.filter(item => 
			item.url.toLowerCase().includes(searchTerm.toLowerCase())
		);

		if (sortOrder === 'oldest') {
			items = [...items].sort((a, b) => (b.domainAgeYears || 0) - (a.domainAgeYears || 0));
		} else if (sortOrder === 'newest') {
			items = [...items].sort((a, b) => (a.domainAgeYears || 0) - (b.domainAgeYears || 0));
		}
    
		return items;
	}, [history, sortOrder, searchTerm]);

	if (history.length === 0) return null;

	return (
		<section id="history" className="mx-auto w-full max-w-7xl px-4 py-16">
			<div className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
				<div>
					<h2 className="text-2xl font-bold text-white flex items-center gap-3">
						<History className="text-blue-500" />
						Security Scan Archive
					</h2>
					<p className="text-slate-400 mt-1">Audit and filter analysis reports for previously scanned infrastructure</p>
				</div>
        
				<div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
					<div className="relative w-full sm:w-64 group">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={16} />
						<input 
							type="text"
							placeholder="Filter by URL..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-2 pl-10 pr-10 text-sm text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-600 focus:ring-4 focus:ring-blue-500/5"
						/>
						{searchTerm && (
							<button 
								onClick={() => setSearchTerm('')}
								aria-label="Clear search"
								title="Clear search"
								className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
							>
								<X size={14} />
							</button>
						)}
					</div>

					<div className="flex items-center gap-2 rounded-xl bg-slate-900/60 border border-white/10 p-1 backdrop-blur-sm w-full sm:w-auto">
						{[
							{ id: 'default', label: 'Recent', icon: Filter },
							{ id: 'oldest', label: 'Oldest Infra', icon: ArrowUp },
							{ id: 'newest', label: 'Newest Infra', icon: ArrowDown },
						].map((opt) => (
							<button
								key={opt.id}
								onClick={() => setSortOrder(opt.id as SortOrder)}
								className={`flex flex-1 sm:flex-none items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
									sortOrder === opt.id 
										? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
										: 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
								}`}
							>
								<opt.icon size={14} />
								<span>{opt.label}</span>
							</button>
						))}
					</div>
				</div>
			</div>

			<div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md">
				<div className="overflow-x-auto">
					<table className="w-full text-left text-sm">
						<thead className="bg-white/5 border-b border-white/10">
							<tr>
								<th className="px-6 py-4 font-semibold text-slate-300">Website URL</th>
								<th className="px-6 py-4 font-semibold text-slate-300 text-center">Security Score</th>
								<th className="px-6 py-4 font-semibold text-slate-300">Risk Level</th>
								<th className={`px-6 py-4 font-semibold transition-colors ${sortOrder !== 'default' ? 'text-blue-400' : 'text-slate-300'}`}>
									<div className="flex items-center gap-2">
										<Calendar size={14} />
										Domain Age
									</div>
								</th>
								<th className="px-6 py-4 font-semibold text-slate-300">Scan Date</th>
								<th className="px-6 py-4 font-semibold text-slate-300 text-center">Subs</th>
								<th className="px-6 py-4 font-semibold text-slate-300 text-right">Action</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-white/5">
							<AnimatePresence mode="popLayout">
								{filteredAndSortedHistory.length > 0 ? (
									filteredAndSortedHistory.map((item) => (
										<motion.tr 
											key={item.id} 
											layout
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
											className="group hover:bg-white/5 transition-colors"
										>
											<td className="px-6 py-4">
												<div className="flex items-center gap-2">
													<span className="font-medium text-white">{item.url}</span>
													<ExternalLink size={14} className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="flex justify-center">
													<div className="relative h-10 w-10 flex items-center justify-center rounded-full border-2 border-slate-800">
														<span className="font-bold text-slate-200">{item.score}</span>
														<div 
															className="absolute inset-0 rounded-full border-2 border-transparent"
															style={{
																borderTopColor: item.score >= 80 ? '#22c55e' : item.score >= 50 ? '#eab308' : '#ef4444',
																borderRightColor: item.score >= 80 ? '#22c55e' : item.score >= 50 ? '#eab308' : '#ef4444',
																transform: `rotate(${item.score * 3.6}deg)`
															}}
														/>
													</div>
												</div>
											</td>
											<td className="px-6 py-4">
												<span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
													item.riskLevel === RiskLevel.LOW ? 'bg-green-500/10 text-green-500' :
													item.riskLevel === RiskLevel.MEDIUM ? 'bg-yellow-500/10 text-yellow-500' :
													'bg-red-500/10 text-red-500'
												}`}>
													{item.riskLevel}
												</span>
											</td>
											<td className="px-6 py-4">
												<span className={`font-mono text-xs ${sortOrder !== 'default' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}>
													{item.domainAgeYears.toFixed(1)} years
												</span>
											</td>
											<td className="px-6 py-4 text-slate-500 text-xs">
												{new Date(item.date).toLocaleDateString()}
											</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-mono text-[10px] border border-blue-500/20">
                          {item.subdomainCount || 0}
                        </span>
                      </td>
											<td className="px-6 py-4 text-right">
												<button className="text-blue-500 font-bold hover:text-blue-400 text-xs transition-colors">RE-SCAN</button>
											</td>
										</motion.tr>
									))
								) : (
									<tr>
										<td colSpan={6} className="px-6 py-20 text-center">
											<div className="flex flex-col items-center gap-3">
												<div className="p-4 rounded-full bg-slate-800/50 text-slate-500">
													<Search size={32} />
												</div>
												<div>
													<p className="text-white font-bold">No matching records found</p>
													<p className="text-slate-500 text-sm mt-1">Try adjusting your search or filters to find what you're looking for.</p>
												</div>
												<button 
													onClick={() => { setSearchTerm(''); setSortOrder('default'); }}
													className="mt-2 text-blue-500 font-bold hover:text-blue-400 text-xs underline underline-offset-4"
												>
													Clear all filters
												</button>
											</div>
										</td>
									</tr>
								)}
							</AnimatePresence>
						</tbody>
					</table>
				</div>
			</div>
      
			<div className="mt-6 flex justify-end">
				<button className="text-slate-500 text-sm font-semibold hover:text-blue-400 flex items-center gap-2 transition-colors group">
					Download Archive Audit <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
				</button>
			</div>
		</section>
	);
};

export default ScanHistory;

