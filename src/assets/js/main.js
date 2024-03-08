import '../css/style.css'
import Chart from 'chart.js/auto'

const DATASET = [
  {
    id: 1,
    title: 'Item 1',
    description: 'Description 1',
    value: 1123,
    group: 'Group 1'
  },
  {
    id: 2,
    title: 'Item 2',
    description: 'Description 2',
    value: 458,
    group: 'Group 1'
  },
  {
    id: 3,
    title: 'Item 3',
    description: 'Description 3',
    value: 454,
    group: 'Group 2'
  },
  {
    id: 4,
    title: 'Item 4',
    description: 'Description 4',
    value: 97,
    group: 'Group 2'
  },
  {
    id: 5,
    title: 'Item 5',
    description: 'Description 5',
    value: 978,
    group: 'Group 2'
  },
  {
    id: 6,
    title: 'Item 6',
    description: 'Description 6',
    value: 213,
    group: 'Group 2'
  },
  {
    id: 7,
    title: 'Item 7',
    description: 'Description 7',
    value: 45,
    group: 'Group 2'
  },
  {
    id: 8,
    title: 'Item 8',
    description: 'Description 8',
    value: 456,
    group: 'Group 3'
  },
  {
    id: 9,
    title: 'Item 9',
    description: 'Description 9',
    value: 789,
    group: 'Group 3'
  },
  {
    id: 10,
    title: 'Item 10',
    description: 'Description 10',
    value: 158,
    group: 'Group 3'
  }
]

const DATA = {
  datasets: [
    {
      data: DATASET
    }
  ]
}

const htmlLegendPlugin = {
  id: 'htmlLegend',
  afterUpdate: (chart, args, options) => {
    const legendContainer = document.getElementById(options.containerId)
    const [dataset] = chart.data.datasets
    const { data, backgroundColor } = dataset

    const groups = []

    data.forEach((item, index) => {
      if (groups.findIndex((group) => group.name === item.group) === -1) {
        groups.push({
          name: item.group,
          items: [],
          visible: true
        })
      }

      const groupIndex = groups.findIndex((group) => group.name === item.group)
      groups[groupIndex].items.push({ ...item, chartIndex: index, backgroundColor: backgroundColor[index], visible: true })
    })

    const html = `
      <ul>
        ${groups.map((group) => (
          `<li>
            ${group.name}
            <ul>
              ${group.items.map((item) => (
                `<li>
                  <button type="button" class="btn btn--item" data-id="${item.id}" data-group="${group.name}" data-chart-index="${item.chartIndex}" style="--color: ${item.backgroundColor};">${item.title}</button>
                </li>`
              )).join('')}
            </ul>
          </li>`
        )).join('')}
      </ul>
    `

    legendContainer.innerHTML = html
  }
}

const CONFIG = {
  type: 'doughnut',
  data: DATA,
  options: {
    parsing: {
      xAxisKey: 'title',
      yAxisKey: 'value'
    },
    plugins: {
      htmlLegend: {
        containerId: 'legend'
      },
      legend: {
        display: false
      }
    }
  },
  plugins: [htmlLegendPlugin]
}

// eslint-disable-next-line no-unused-vars
const chart = new Chart(document.getElementById('chart'), CONFIG)

document.querySelector('#legend').addEventListener('click', (event) => {
  const { target } = event
  const button = target.closest('button')

  if (button.matches('.btn--item')) {
    const { chartIndex } = button.dataset

    chart.toggleDataVisibility(chartIndex)
    chart.update()
  }
})
