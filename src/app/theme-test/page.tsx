'use client'

import { useTheme } from '../../contexts/ThemeContext'
import ThemeToggle from '../../components/ThemeToggle'

export default function ThemeTestPage() {
  const { theme, resolvedTheme } = useTheme()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Theme Test Page
              </h1>
              <ThemeToggle />
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
                    Current Theme Status
                  </h2>
                  <div className="space-y-2">
                    <p className="text-blue-800 dark:text-blue-200">
                      <strong>Selected Theme:</strong> {theme}
                    </p>
                    <p className="text-blue-800 dark:text-blue-200">
                      <strong>Resolved Theme:</strong> {resolvedTheme}
                    </p>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-4">
                    Theme Features
                  </h2>
                  <ul className="space-y-2 text-green-800 dark:text-green-200">
                    <li>• Light mode for professional use</li>
                    <li>• Dark mode for low-light environments</li>
                    <li>• System mode follows device preference</li>
                    <li>• Persistent across sessions</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Component Examples
                </h2>
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <button className="btn-primary">Primary Button</button>
                    <button className="btn-secondary">Secondary Button</button>
                  </div>
                  
                  <div className="space-y-2">
                    <input 
                      type="text" 
                      placeholder="Input field example" 
                      className="input-field"
                    />
                    <textarea 
                      placeholder="Textarea example" 
                      className="input-field h-20"
                    />
                  </div>

                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Card Component
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      This card demonstrates how components adapt to the current theme.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-yellow-900 dark:text-yellow-100 mb-4">
                  Color Palette Test
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-red-500 text-white p-4 rounded text-center">Red</div>
                  <div className="bg-blue-500 text-white p-4 rounded text-center">Blue</div>
                  <div className="bg-green-500 text-white p-4 rounded text-center">Green</div>
                  <div className="bg-purple-500 text-white p-4 rounded text-center">Purple</div>
                </div>
              </div>

              {/* Status Labels Showcase */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
                  Status Labels
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Job Status</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="badge status-published">Published</span>
                      <span className="badge status-draft">Draft</span>
                      <span className="badge status-closed">Closed</span>
                      <span className="badge status-urgent">Urgent</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Priority Levels</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="badge priority-high">High Priority</span>
                      <span className="badge priority-medium">Medium Priority</span>
                      <span className="badge priority-low">Low Priority</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Candidate Status</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="badge candidate-inbox">Inbox</span>
                      <span className="badge candidate-reviewing">Reviewing</span>
                      <span className="badge candidate-interviewing">Interviewing</span>
                      <span className="badge candidate-offer">Offer</span>
                      <span className="badge candidate-rejected">Rejected</span>
                      <span className="badge candidate-hired">Hired</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Button Variants Showcase */}
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-4">
                  Button Variants
                </h2>
                <div className="flex flex-wrap gap-2">
                  <button className="btn-primary">Primary</button>
                  <button className="btn-secondary">Secondary</button>
                  <button className="btn-success">Success</button>
                  <button className="btn-warning">Warning</button>
                  <button className="btn-danger">Danger</button>
                  <button className="btn-outline">Outline</button>
                </div>
              </div>

              {/* Alert Styles Showcase */}
              <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-purple-900 dark:text-purple-100 mb-4">
                  Alert Styles
                </h2>
                <div className="space-y-2">
                  <div className="p-3 rounded alert-success">Success alert message</div>
                  <div className="p-3 rounded alert-warning">Warning alert message</div>
                  <div className="p-3 rounded alert-error">Error alert message</div>
                  <div className="p-3 rounded alert-info">Info alert message</div>
                </div>
              </div>

              {/* Progress Bars Showcase */}
              <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-4">
                  Progress Bars
                </h2>
                <div className="space-y-2">
                  <div className="progress-bar h-2">
                    <div className="progress-fill w-3/4"></div>
                  </div>
                  <div className="progress-bar h-2">
                    <div className="progress-fill w-1/2"></div>
                  </div>
                  <div className="progress-bar h-2">
                    <div className="progress-fill w-1/4"></div>
                  </div>
                </div>
              </div>

              {/* Table Example */}
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Table Styles
                </h2>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Status</th>
                      <th>Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>John Doe</td>
                      <td><span className="badge candidate-reviewing">Reviewing</span></td>
                      <td><span className="badge priority-high">High</span></td>
                    </tr>
                    <tr>
                      <td>Jane Smith</td>
                      <td><span className="badge candidate-interviewing">Interviewing</span></td>
                      <td><span className="badge priority-medium">Medium</span></td>
                    </tr>
                    <tr>
                      <td>Bob Johnson</td>
                      <td><span className="badge candidate-offer">Offer</span></td>
                      <td><span className="badge priority-low">Low</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
